<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'program_id',
    'academic_year',
    'total_students_count',
    'placed_count',
    'higher_studies_count',
    'entrepreneur_count',
])]
class ProgramPlacementIndex extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'academic_year' => 'integer',
            'total_students_count' => 'integer',
            'placed_count' => 'integer',
            'higher_studies_count' => 'integer',
            'entrepreneur_count' => 'integer',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
