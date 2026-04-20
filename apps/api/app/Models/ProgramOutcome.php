<?php

namespace App\Models;

use Database\Factories\ProgramOutcomeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'institution_id',
    'program_id',
    'type',
    'name',
    'description',
    'syllabus_scheme',
    'academic_year',
])]
class ProgramOutcome extends Model
{
    /** @use HasFactory<ProgramOutcomeFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
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
}
