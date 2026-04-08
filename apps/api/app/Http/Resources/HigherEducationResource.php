<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('HigherEducation')]
class HigherEducationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'college_name' => $this->college_name,
            /** @format integer */
            'rank' => $this->rank,
            /** @format integer */
            'academic_year' => $this->academic_year,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'student' => $this->whenLoaded(
                'student',
                fn() => StudentResource::make($this->student)
            ),
            'program' => $this->whenLoaded(
                'program',
                fn() => ProgramResource::make($this->program)
            ),
        ];
    }
}
