<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('CourseMonthlyAttendance')]
class CourseMonthlyAttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'course_id' => $this->course_id,
            'month' => $this->month,
            'academic_year' => $this->academic_year,
            'total_classes_held' => $this->total_classes_held,
            'minimum_attendance_percent' => (float) $this->minimum_attendance_percent,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'course' => SubjectResource::make($this->whenLoaded('course')),
            'attendance_students' => CourseMonthlyAttendanceStudentResource::collection(
                $this->whenLoaded('attendance_students'),
            ),
        ];
    }
}
