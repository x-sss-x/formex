<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'institution_id',
    'program_id',
    'student_id',
    'test_id',
    'course_outcome_id',
    'marks',
    'academic_year',
])]
class TestStudentMark extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'marks' => 'integer',
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

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function courseOutcome(): BelongsTo
    {
        return $this->belongsTo(CourseOutcome::class);
    }
}
