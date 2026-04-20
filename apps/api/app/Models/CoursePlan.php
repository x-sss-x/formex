<?php

namespace App\Models;

use Database\Factories\CoursePlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'institution_id',
    'program_id',
    'course_id',
    'course_coordinator_id',
    'semester',
    'week_no',
    'topic_no',
    'planned_date',
    'completed_date',
    'teaching_aids',
    'outcome',
    'remarks',
    'academic_year',
])]
class CoursePlan extends Model
{
    /** @use HasFactory<CoursePlanFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'week_no' => 'integer',
            'topic_no' => 'integer',
            'academic_year' => 'integer',
            'planned_date' => 'datetime',
            'completed_date' => 'datetime',
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

    public function course(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'course_id');
    }

    public function course_coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'course_coordinator_id');
    }
}
