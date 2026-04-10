<?php

use App\Mail\FacultyInvitationMail;
use App\Models\FacultyInvitation;
use App\Models\Institution;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function facultyInvitationHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

function loginPrincipalForInvites($test, User $principal): void
{
    $test->withCredentials();
    $test->postJson('/api/login', [
        'email' => $principal->email,
        'password' => 'password123',
    ], facultyInvitationHeaders())->assertOk();

    Auth::forgetGuards();
    $test->withCredentials();
}

test('principal can invite faculty and mail is sent', function (): void {
    Mail::fake();

    $principal = User::factory()->create([
        'email' => 'principal-invite@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create([
        'name' => 'Apollo Institute',
    ]);
    $principal->institutions()->attach($institution->id, ['role' => 'principal']);

    loginPrincipalForInvites($this, $principal);

    $this->postJson('/api/user/current-institution', [
        'institution_id' => $institution->id,
    ], facultyInvitationHeaders())->assertOk();

    $this->postJson('/api/institutions/current/faculty/invitations', [
        'full_name' => 'Invited Faculty',
        'email' => 'invited@example.com',
    ], facultyInvitationHeaders())
        ->assertCreated()
        ->assertJsonPath('message', 'Invitation sent successfully.');

    $invitation = FacultyInvitation::query()->where('email', 'invited@example.com')->first();
    expect($invitation)->not->toBeNull();

    Mail::assertSent(FacultyInvitationMail::class, function (FacultyInvitationMail $mail): bool {
        return $mail->hasTo('invited@example.com');
    });
});

test('invitation details can be fetched using token', function (): void {
    $token = 'token-test-123';
    FacultyInvitation::query()->create([
        'institution_id' => Institution::factory()->create()->id,
        'invited_by_user_id' => User::factory()->create()->id,
        'full_name' => 'Fixed Person',
        'email' => 'fixed@example.com',
        'token_hash' => hash('sha256', $token),
        'expires_at' => now()->addDay(),
    ]);

    $this->getJson('/api/faculty-invitations/'.$token, facultyInvitationHeaders())
        ->assertOk()
        ->assertJsonPath('data.full_name', 'Fixed Person')
        ->assertJsonPath('data.email', 'fixed@example.com');
});

test('accept invitation creates account with fixed name and email', function (): void {
    $institution = Institution::factory()->create();
    $inviter = User::factory()->create();
    $token = 'accept-token-123';

    FacultyInvitation::query()->create([
        'institution_id' => $institution->id,
        'invited_by_user_id' => $inviter->id,
        'full_name' => 'Fixed Invitee',
        'email' => 'fixed-invitee@example.com',
        'token_hash' => hash('sha256', $token),
        'expires_at' => now()->addDay(),
    ]);

    $this->withCredentials();
    $this->postJson('/api/faculty-invitations/accept', [
        'token' => $token,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], facultyInvitationHeaders())->assertCreated();

    $user = User::query()->where('email', 'fixed-invitee@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user?->name)->toBe('Fixed Invitee');
    expect($user?->institutions()->where('institutions.id', $institution->id)->exists())->toBeTrue();

    $invitation = FacultyInvitation::query()->where('token_hash', hash('sha256', $token))->first();
    expect($invitation?->accepted_at)->not->toBeNull();
});

test('expired invitation cannot be accepted', function (): void {
    $token = 'expired-token-123';
    FacultyInvitation::query()->create([
        'institution_id' => Institution::factory()->create()->id,
        'invited_by_user_id' => User::factory()->create()->id,
        'full_name' => 'Old Invitee',
        'email' => 'old@example.com',
        'token_hash' => hash('sha256', $token),
        'expires_at' => now()->subMinute(),
    ]);

    $this->withCredentials();
    $this->postJson('/api/faculty-invitations/accept', [
        'token' => $token,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], facultyInvitationHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.token.0', 'Invitation token is invalid or expired.');
});
