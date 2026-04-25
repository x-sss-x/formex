<?php

use App\Models\CoPoPsoStrength;
use App\Models\CourseOutcome;
use App\Models\Institution;
use App\Models\Program;
use App\Models\ProgramOutcome;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function coPoPsoSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('co-po-pso strength mapping can be stored and listed by program semester', function () {
    $user = User::factory()->create([
        'email' => 'co-po-pso@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $subject = Subject::query()->create([
        'name' => 'Software Engineering',
        'short_name' => 'SE',
        'code' => 'SE301',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    $courseOutcome = CourseOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'course_id' => $subject->id,
        'type' => 'course_outcome',
        'name' => 'CO1',
        'description' => 'Understand software process models.',
        'syllabus_scheme' => 'C25',
        'academic_year' => (int) date('Y'),
    ]);
    $programOutcome = ProgramOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'type' => 'program_outcome',
        'name' => 'PO1',
        'description' => 'Apply engineering knowledge.',
        'syllabus_scheme' => 'C25',
        'academic_year' => (int) date('Y'),
    ]);
    $programSpecificOutcome = ProgramOutcome::query()->create([
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'type' => 'program_specific_outcome',
        'name' => 'PSO1',
        'description' => 'Build scalable systems.',
        'syllabus_scheme' => 'C25',
        'academic_year' => (int) date('Y'),
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'co-po-pso@example.com',
        'password' => 'password123',
    ], coPoPsoSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $this->putJson("/api/programs/{$program->id}/co-po-pso-strengths", [
        'semester' => 3,
        'rows' => [
            [
                'course_outcome_id' => $courseOutcome->id,
                'program_outcome_id' => $programOutcome->id,
                'strength' => 2,
            ],
            [
                'course_outcome_id' => $courseOutcome->id,
                'program_outcome_id' => $programSpecificOutcome->id,
                'strength' => 3,
            ],
        ],
    ], coPoPsoSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.semester', 3);

    $this->getJson("/api/programs/{$program->id}/co-po-pso-strengths?semester=3", coPoPsoSpaHeaders())
        ->assertOk()
        ->assertJsonCount(2, 'data');

    expect(CoPoPsoStrength::query()
        ->where('program_id', $program->id)
        ->where('semester', 3)
        ->count())->toBe(2);
});
