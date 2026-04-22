<?php

namespace Database\Factories;

use App\Models\CourseMonthlyAttendance;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseMonthlyAttendance>
 */
class CourseMonthlyAttendanceFactory extends Factory
{
    protected $model = CourseMonthlyAttendance::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $institution = Institution::factory()->create();
        $program = Program::factory()->create([
            'institution_id' => $institution->id,
        ]);
        $course = Subject::query()->create([
            'name' => fake()->words(2, true),
            'short_name' => strtoupper(fake()->lexify('??')).fake()->numberBetween(100, 499),
            'type' => 'theory',
            'semester' => 5,
            'scheme' => 'C25',
            'institution_id' => $institution->id,
            'program_id' => $program->id,
        ]);

        return [
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'course_id' => $course->id,
            'month' => fake()->numberBetween(1, 12),
            'academic_year' => fake()->numberBetween(2024, 2026),
            'total_classes_held' => fake()->numberBetween(10, 30),
            'minimum_attendance_percent' => 75.0,
        ];
    }
}
