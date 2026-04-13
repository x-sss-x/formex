<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('SkillProgram')]
class SkillProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'institution_id' => $this->institution_id,
            'student_id' => $this->student_id,
            'semester' => $this->semester,
            'details' => $this->details,
            'resource_person_name' => $this->resource_person_name,
            'company_name' => $this->company_name,
            'designation' => $this->designation,
            'conducted_date' => $this->conducted_date,
            'academic_year' => $this->academic_year,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'student' => StudentResource::make($this->whenLoaded('student')),
        ];
    }
}
