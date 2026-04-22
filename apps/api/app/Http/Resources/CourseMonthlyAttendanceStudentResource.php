<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('CourseMonthlyAttendanceStudent')]
class CourseMonthlyAttendanceStudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $parent = $this->course_monthly_attendance;
        $held = (int) ($parent?->total_classes_held ?? 0);
        $min = (float) ($parent?->minimum_attendance_percent ?? 0);
        $attended = (int) $this->total_classes_attended;
        $attendancePercent = $held > 0 ? round(100 * $attended / $held, 2) : 0.0;
        $meetsMinimum = $attendancePercent >= $min;

        return [
            'id' => $this->id,
            'course_monthly_attendance_id' => $this->course_monthly_attendance_id,
            'student_id' => $this->student_id,
            'total_classes_attended' => $this->total_classes_attended,
            'remarks' => $this->remarks,
            'attendance_percent' => $attendancePercent,
            'meets_minimum' => $meetsMinimum,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'student' => StudentResource::make($this->whenLoaded('student')),
        ];
    }
}
