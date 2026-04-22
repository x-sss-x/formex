<?php

namespace App\Models;

use Database\Factories\CourseMonthlyAttendanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'institution_id',
    'program_id',
    'course_id',
    'month',
    'academic_year',
    'total_classes_held',
    'minimum_attendance_percent',
])]
class CourseMonthlyAttendance extends Model
{
    /** @use HasFactory<CourseMonthlyAttendanceFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'academic_year' => 'integer',
            'total_classes_held' => 'integer',
            'minimum_attendance_percent' => 'float',
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

    public function attendance_students(): HasMany
    {
        return $this->hasMany(CourseMonthlyAttendanceStudent::class, 'course_monthly_attendance_id');
    }

    /**
     * Eager-loaded student rows do not have the parent set; resources need it to compute percent vs minimum.
     */
    public function withAttendanceContext(): self
    {
        if ($this->relationLoaded('attendance_students')) {
            $this->attendance_students->each(
                function (CourseMonthlyAttendanceStudent $row): void {
                    $row->setRelation('course_monthly_attendance', $this);
                },
            );
        }

        return $this;
    }
}
