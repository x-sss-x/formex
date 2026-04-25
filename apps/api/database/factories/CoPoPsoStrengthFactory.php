<?php

namespace Database\Factories;

use App\Models\CoPoPsoStrength;
use App\Models\CourseOutcome;
use App\Models\ProgramOutcome;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CoPoPsoStrength>
 */
class CoPoPsoStrengthFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $courseOutcome = CourseOutcome::factory()->create();
        $programOutcome = ProgramOutcome::factory()->create([
            'institution_id' => $courseOutcome->institution_id,
            'program_id' => $courseOutcome->program_id,
            'type' => fake()->randomElement(['program_outcome', 'program_specific_outcome']),
        ]);

        return [
            'institution_id' => $courseOutcome->institution_id,
            'program_id' => $courseOutcome->program_id,
            'course_outcome_id' => $courseOutcome->id,
            'program_outcome_id' => $programOutcome->id,
            'semester' => fake()->numberBetween(1, 6),
            'strength' => fake()->numberBetween(1, 3),
            'academic_year' => fake()->numberBetween(2024, 2035),
        ];
    }
}
