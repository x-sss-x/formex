<?php

namespace Database\Factories;

use App\Models\CoursePlan;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CoursePlan>
 */
class CoursePlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
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
            'type' => fake()->randomElement(['theory', 'practical']),
            'semester' => fake()->numberBetween(1, 8),
            'scheme' => 'C25',
            'institution_id' => $institution->id,
            'program_id' => $program->id,
        ]);
        $coordinator = User::factory()->create();
        $coordinator->institutions()->attach($institution->id, ['role' => 'course_coordinator']);

        return [
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'course_id' => $course->id,
            'course_coordinator_id' => $coordinator->id,
            'semester' => $course->semester,
            'week_no' => fake()->numberBetween(1, 20),
            'topic_no' => fake()->numberBetween(1, 10),
            'planned_date' => fake()->dateTime(),
            'completed_date' => fake()->optional()->dateTime(),
            'teaching_aids' => fake()->optional()->sentence(),
            'outcome' => fake()->optional()->sentence(),
            'remarks' => fake()->optional()->sentence(),
            'academic_year' => fake()->numberBetween(2024, 2030),
        ];
    }
}
