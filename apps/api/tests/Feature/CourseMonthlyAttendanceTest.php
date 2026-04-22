<?php

use App\Models\Institution;
use App\Models\Program;
use App\Models\Student;
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

function courseMonthlyAttendanceSpaHeaders(): array
{
    $origin = config('app.frontend_url');

    return [
        'Origin' => $origin,
        'Referer' => rtrim($origin, '/').'/',
        'Accept' => 'application/json',
    ];
}

test('course monthly attendance create list show update and delete for subject', function () {
    $user = User::factory()->create([
        'email' => 'course-mthly-att@example.com',
        'password' => 'password123',
    ]);

    $institution = Institution::factory()->create();
    $user->institutions()->attach($institution->id, ['role' => 'principal']);
    $year = (int) now()->year;

    $program = Program::factory()->create([
        'institution_id' => $institution->id,
    ]);

    $subject = Subject::query()->create([
        'name' => 'Attendance 101',
        'short_name' => 'ATT',
        'type' => 'theory',
        'semester' => 3,
        'scheme' => 'C25',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
    ]);

    $s1 = Student::query()->create([
        'full_name' => 'Alice A',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 3,
        'academic_year' => $year,
    ]);
    $s2 = Student::query()->create([
        'full_name' => 'Bob B',
        'institution_id' => $institution->id,
        'program_id' => $program->id,
        'semester' => 3,
        'academic_year' => $year,
    ]);

    $this->withCredentials();
    $this->postJson('/api/login', [
        'email' => 'course-mthly-att@example.com',
        'password' => 'password123',
    ], courseMonthlyAttendanceSpaHeaders())->assertOk();
    Auth::forgetGuards();
    $this->withCredentials();
    $this->withSession([
        'academic_year_by_institution' => [
            (string) $institution->id => $year,
        ],
    ]);

    $this->postJson("/api/subjects/{$subject->id}/course-monthly-attendances", [
        'month' => 3,
        'academic_year' => $year,
        'total_classes_held' => 20,
        'minimum_attendance_percent' => 75,
        'students' => [
            [
                'student_id' => $s1->id,
                'total_classes_attended' => 20,
                'remarks' => 'Good',
            ],
            [
                'student_id' => $s2->id,
                'total_classes_attended' => 10,
                'remarks' => 'Needs follow-up',
            ],
        ],
    ], courseMonthlyAttendanceSpaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.total_classes_held', 20)
        ->assertJsonPath('data.minimum_attendance_percent', 75)
        ->assertJsonPath('data.attendance_students.0.meets_minimum', true)
        ->assertJsonPath('data.attendance_students.0.attendance_percent', 100)
        ->assertJsonPath('data.attendance_students.1.meets_minimum', false)
        ->assertJsonPath('data.attendance_students.1.attendance_percent', 50);

    $this->postJson("/api/subjects/{$subject->id}/course-monthly-attendances", [
        'month' => 3,
        'academic_year' => $year,
        'total_classes_held' => 20,
        'minimum_attendance_percent' => 75,
        'students' => [
            [
                'student_id' => $s1->id,
                'total_classes_attended' => 0,
            ],
        ],
    ], courseMonthlyAttendanceSpaHeaders())->assertStatus(422);

    $rowId = DB::table('course_monthly_attendances')
        ->where('course_id', $subject->id)
        ->value('id');

    $this->getJson("/api/subjects/{$subject->id}/course-monthly-attendances", courseMonthlyAttendanceSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.0.id', $rowId);

    $this->getJson("/api/course-monthly-attendances/{$rowId}", courseMonthlyAttendanceSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.id', $rowId);

    $this->putJson("/api/course-monthly-attendances/{$rowId}", [
        'month' => 3,
        'academic_year' => $year,
        'total_classes_held' => 20,
        'minimum_attendance_percent' => 50,
        'students' => [
            [
                'student_id' => $s1->id,
                'total_classes_attended' => 20,
                'remarks' => null,
            ],
            [
                'student_id' => $s2->id,
                'total_classes_attended' => 10,
                'remarks' => 'Borderline',
            ],
        ],
    ], courseMonthlyAttendanceSpaHeaders())
        ->assertOk()
        ->assertJsonPath('data.minimum_attendance_percent', 50)
        ->assertJsonPath('data.attendance_students.1.meets_minimum', true);

    $this->deleteJson("/api/course-monthly-attendances/{$rowId}", [], courseMonthlyAttendanceSpaHeaders())
        ->assertOk();

    $this->getJson("/api/course-monthly-attendances/{$rowId}", courseMonthlyAttendanceSpaHeaders())
        ->assertNotFound();
});
