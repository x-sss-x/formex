<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\ProgramOutcome;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function programOutcomeSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('program outcomes CRUD under /api/program-outcomes and /api/programs/{program}/program-outcomes', function () {
    $user = User::factory()->create([
        'email' => 'program-outcome-crud@example.com',
        'password' => 'password123',
    ]);
    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'program-outcome-crud@example.com',
        'password' => 'password123',
    ], programOutcomeSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $this->postJson("/api/programs/{$program->id}/program-outcomes", [
        'type' => 'program_outcome',
        'name' => 'Ability to apply mathematical foundations',
        'description' => 'Students apply problem solving methods to software systems.',
        'syllabus_scheme' => 'C25',
    ], programOutcomeSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.program_id', $program->id)
        ->assertJsonPath('data.type', 'program_outcome')
        ->assertJsonPath('data.academic_year', (int) date('Y'))
        ->assertJsonPath('data.name', 'Ability to apply mathematical foundations');

    $created = ProgramOutcome::query()
        ->where('program_id', $program->id)
        ->where('name', 'Ability to apply mathematical foundations')
        ->firstOrFail();

    $this->getJson('/api/program-outcomes', programOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $created->id);

    $this->getJson("/api/programs/{$program->id}/program-outcomes", programOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $created->id);

    $this->putJson("/api/program-outcomes/{$created->id}", [
        'type' => 'program_specific_outcome',
        'name' => 'Ability to design and evaluate software systems',
        'description' => 'Students can design, build and evaluate complete systems.',
        'syllabus_scheme' => 'R22',
    ], programOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.type', 'program_specific_outcome')
        ->assertJsonPath('data.name', 'Ability to design and evaluate software systems')
        ->assertJsonPath('data.syllabus_scheme', 'R22')
        ->assertJsonPath('data.academic_year', (int) date('Y'));

    $this->deleteJson("/api/program-outcomes/{$created->id}", [], programOutcomeSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.id', $created->id);

    expect(ProgramOutcome::query()->whereKey($created->id)->exists())->toBeFalse();
});
