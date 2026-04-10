<?php

namespace App\Http\Controllers;

use App\Mail\FacultyInvitationMail;
use App\Models\FacultyInvitation;
use App\Models\User;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FacultyInvitationController
{
    /**
     * Invite faculty by name and email, then send signup link.
     */
    public function store(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        if (User::query()->where('email', $validated['email'])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['This email is already registered. Ask them to sign in.'],
            ]);
        }

        FacultyInvitation::query()
            ->where('institution_id', $institution->id)
            ->where('email', $validated['email'])
            ->whereNull('accepted_at')
            ->delete();

        $token = Str::random(64);
        $invitation = FacultyInvitation::query()->create([
            'institution_id' => $institution->id,
            'invited_by_user_id' => $request->user()->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(7),
        ]);

        $signupUrl = rtrim((string) config('app.frontend_url'), '/').'/sign-up?invitation='.$token;
        Mail::to($invitation->email)->send(
            new FacultyInvitationMail(
                fullName: $invitation->full_name,
                institutionName: $institution->name,
                signupUrl: $signupUrl,
            ),
        );

        return response()->json([
            'message' => 'Invitation sent successfully.',
        ], 201);
    }

    /**
     * Resolve invitation details for the signup page.
     */
    public function show(string $token)
    {
        $invitation = $this->findActiveInvitation($token);

        return response()->json([
            'data' => [
                'full_name' => $invitation->full_name,
                'email' => $invitation->email,
            ],
        ]);
    }

    /**
     * Accept invitation and create account with fixed invitation details.
     */
    public function accept(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $invitation = $this->findActiveInvitation($validated['token']);

        if (User::query()->where('email', $invitation->email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['This invitation email is already registered. Please sign in.'],
            ]);
        }

        $user = User::query()->create([
            'name' => $invitation->full_name,
            'email' => $invitation->email,
            'password' => $validated['password'],
        ]);

        $user->institutions()->attach($invitation->institution_id, ['role' => 'course_coordinator']);

        $invitation->update([
            'accepted_at' => now(),
            'accepted_by_user_id' => $user->id,
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put(CurrentInstitutionSession::SESSION_KEY, $invitation->institution_id);

        return response()->json(null, 201);
    }

    private function findActiveInvitation(string $token): FacultyInvitation
    {
        $invitation = FacultyInvitation::query()
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('accepted_at')
            ->where('expires_at', '>=', now())
            ->first();

        if ($invitation === null) {
            throw ValidationException::withMessages([
                'token' => ['Invitation token is invalid or expired.'],
            ]);
        }

        return $invitation;
    }
}
