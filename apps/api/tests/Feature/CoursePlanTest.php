<?php

use App\Models\CoursePlan;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

function coursePlanSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('course plans CRUD under /api/course-plans and /api/subjects/{subject}/course-plans', function () {
    $user = User::factory()->create([
        'email' => 'course-plan-crud@example.com',
        'password' => 'password123',
    ]);
    $coordinator = User::factory()->create();

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);
    $coordinator->institutions()->attach($institution->id, ['role' => 'course_coordinator']);

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);
    $subject = Subject::query()->create([
        'name' => 'Database Systems',
        'short_name' => 'DBMS',
        'type' => 'theory',
        'semester' => 5,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    DB::table('institution_user_subject')->insert([
        'institution_id' => $institution->id,
        'subject_id' => $subject->id,
        'user_id' => $coordinator->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'course-plan-crud@example.com',
        'password' => 'password123',
    ], coursePlanSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();

    $this->postJson("/api/subjects/{$subject->id}/course-plans", [
        'course_coordinator_id' => $coordinator->id,
        'week_no' => 1,
        'topic_no' => 1,
        'planned_date' => '2026-04-10 09:00:00',
        'completed_date' => '2026-04-10 11:00:00',
        'teaching_aids' => 'Board',
        'outcome' => 'Topic completed',
        'remarks' => 'On schedule',
    ], coursePlanSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.course_id', $subject->id)
        ->assertJsonPath('data.program_id', $program->id)
        ->assertJsonPath('data.semester', 5)
        ->assertJsonPath('data.week_no', 1);

    $created = CoursePlan::query()
        ->where('course_id', $subject->id)
        ->where('week_no', 1)
        ->firstOrFail();

    $this->getJson('/api/course-plans', coursePlanSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $created->id);

    $this->getJson("/api/subjects/{$subject->id}/course-plans", coursePlanSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $created->id);

    $this->putJson("/api/course-plans/{$created->id}", [
        'course_coordinator_id' => $coordinator->id,
        'week_no' => 2,
        'topic_no' => 1,
        'planned_date' => '2026-04-12 09:00:00',
        'completed_date' => null,
        'teaching_aids' => 'Lab',
        'outcome' => 'Practice completed',
        'remarks' => 'Need recap',
        'academic_year' => 2026,
    ], coursePlanSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.week_no', 2)
        ->assertJsonPath('data.teaching_aids', 'Lab');

    $this->deleteJson("/api/course-plans/{$created->id}", [], coursePlanSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.id', $created->id);

    expect(CoursePlan::query()->whereKey($created->id)->exists())->toBeFalse();
});
