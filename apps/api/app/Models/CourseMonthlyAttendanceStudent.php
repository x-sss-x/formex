<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'course_monthly_attendance_id',
    'student_id',
    'total_classes_attended',
    'remarks',
])]
class CourseMonthlyAttendanceStudent extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'total_classes_attended' => 'integer',
        ];
    }

    public function course_monthly_attendance(): BelongsTo
    {
        return $this->belongsTo(CourseMonthlyAttendance::class, 'course_monthly_attendance_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
