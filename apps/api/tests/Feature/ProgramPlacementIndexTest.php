<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function placementIndexSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('program placement index stores year wise values and computes format', function () {
    $user = User::factory()->create([
        'email' => 'program-placement-index@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'program-placement-index@example.com',
        'password' => 'password123',
    ], placementIndexSpaHeaders())->assertOk();
    $this->withCredentials();

    $this->putJson("/api/programs/{$program->id}/placement-index", [
        'rows' => [
            [
                'academic_year' => 2026,
                'total_students_count' => 100,
                'placed_count' => 40,
                'higher_studies_count' => 20,
                'entrepreneur_count' => 10,
            ],
            [
                'academic_year' => 2025,
                'total_students_count' => 90,
                'placed_count' => 30,
                'higher_studies_count' => 18,
                'entrepreneur_count' => 12,
            ],
            [
                'academic_year' => 2024,
                'total_students_count' => 80,
                'placed_count' => 24,
                'higher_studies_count' => 16,
                'entrepreneur_count' => 8,
            ],
        ],
    ], placementIndexSpaHeaders())->assertOk();

    $this->getJson("/api/programs/{$program->id}/placement-index?academic_year=2026", placementIndexSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.lyg.academic_year', 2026)
        ->assertJsonPath('data.lyg.total_students_count', 100)
        ->assertJsonPath('data.lyg.weighted_total', 80)
        ->assertJsonPath('data.lyg.placement_index', 0.8)
        ->assertJsonPath('data.lyg_m1.academic_year', 2025)
        ->assertJsonPath('data.lyg_m1.weighted_total', 67.5)
        ->assertJsonPath('data.lyg_m1.placement_index', 0.75)
        ->assertJsonPath('data.lyg_m2.academic_year', 2024)
        ->assertJsonPath('data.lyg_m2.weighted_total', 54)
        ->assertJsonPath('data.lyg_m2.placement_index', 0.675)
        ->assertJsonPath('data.average_placement_index', 0.7417);

    $this->getJson("/api/programs/{$program->id}/placement-index-rows", placementIndexSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.academic_year', 2026)
        ->assertJsonPath('data.0.weighted_total', 80)
        ->assertJsonPath('data.0.placement_index', 0.8)
        ->assertJsonPath('data.1.academic_year', 2025)
        ->assertJsonPath('data.2.academic_year', 2024);
});
