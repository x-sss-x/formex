<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\Program;
use App\Models\ProgramOutcome;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProgramOutcome>
 */
class ProgramOutcomeFactory extends Factory
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

        return [
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'type' => fake()->randomElement([
                'program_outcome',
                'program_specific_outcome',
                'program_educational_objectives',
            ]),
            'name' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'syllabus_scheme' => fake()->optional()->randomElement(['C20', 'C25', 'R22']),
            'academic_year' => fake()->numberBetween(2024, 2035),
        ];
    }
}
