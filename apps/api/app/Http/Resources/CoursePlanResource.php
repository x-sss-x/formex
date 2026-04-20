<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('CoursePlan')]
class CoursePlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'course_id' => $this->course_id,
            'course_coordinator_id' => $this->course_coordinator_id,
            'semester' => $this->semester,
            'week_no' => $this->week_no,
            'topic_no' => $this->topic_no,
            'planned_date' => $this->planned_date,
            'completed_date' => $this->completed_date,
            'teaching_aids' => $this->teaching_aids,
            'outcome' => $this->outcome,
            'remarks' => $this->remarks,
            'academic_year' => $this->academic_year,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'course' => SubjectResource::make($this->whenLoaded('course')),
            'course_coordinator' => UserResource::make($this->whenLoaded('course_coordinator')),
        ];
    }
}
