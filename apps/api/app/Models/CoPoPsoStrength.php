<?php

namespace App\Models;

use Database\Factories\CoPoPsoStrengthFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'institution_id',
    'program_id',
    'course_outcome_id',
    'program_outcome_id',
    'semester',
    'strength',
    'academic_year',
])]
class CoPoPsoStrength extends Model
{
    /** @use HasFactory<CoPoPsoStrengthFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'strength' => 'integer',
            'academic_year' => 'integer',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function courseOutcome(): BelongsTo
    {
        return $this->belongsTo(CourseOutcome::class);
    }

    public function programOutcome(): BelongsTo
    {
        return $this->belongsTo(ProgramOutcome::class);
    }
}
