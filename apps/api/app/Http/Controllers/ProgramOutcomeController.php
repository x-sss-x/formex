<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProgramOutcomeResource;
use App\Models\Program;
use App\Models\ProgramOutcome;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProgramOutcomeController
{
    private const TYPES = [
        'program_outcome',
        'program_specific_outcome',
        'program_educational_objectives',
    ];

    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $outcomes = $institution
            ->program_outcomes()
            ->with('program')
            ->latest()
            ->get();

        return ProgramOutcomeResource::collection($outcomes);
    }

    public function listByProgram(Request $request, Program $program)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();
        $outcomes = $program
            ->program_outcomes()
            ->with('program')
            ->latest()
            ->get();

        return ProgramOutcomeResource::collection($outcomes);
    }

    public function store(Request $request, Program $program): ProgramOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        $program = $institution->programs()->whereKey($program->id)->firstOrFail();

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(self::TYPES)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'syllabus_scheme' => ['nullable', 'string'],
        ]);

        $outcome = $program->program_outcomes()->create([
            ...$validated,
            'institution_id' => $institution->id,
            'academic_year' => $institution->academic_year,
        ]);

        return ProgramOutcomeResource::make($outcome->loadMissing('program'));
    }

    public function show(Request $request, ProgramOutcome $programOutcome): ProgramOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($programOutcome->institution_id === $institution->id, 404);

        return ProgramOutcomeResource::make($programOutcome->loadMissing('program'));
    }

    public function update(Request $request, ProgramOutcome $programOutcome): ProgramOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($programOutcome->institution_id === $institution->id, 404);

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(self::TYPES)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'syllabus_scheme' => ['nullable', 'string'],
        ]);

        $programOutcome->update([
            ...$validated,
            'academic_year' => $institution->academic_year,
        ]);

        return ProgramOutcomeResource::make($programOutcome->loadMissing('program'));
    }

    public function destroy(Request $request, ProgramOutcome $programOutcome): ProgramOutcomeResource
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);
        abort_unless($programOutcome->institution_id === $institution->id, 404);

        $programOutcome->delete();

        return ProgramOutcomeResource::make($programOutcome->loadMissing('program'));
    }
}
