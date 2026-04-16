<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TimetableSlotSubject')]
class TimetableSlotSubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subjectName = data_get($this->resource, 'subject_name');
        if (! is_string($subjectName) || $subjectName === '') {
            $subjectName = (string) data_get($this->resource, 'subject.name', '');
        }

        $coordinatorName = data_get($this->resource, 'course_coordinator_name');
        if (! is_string($coordinatorName) || $coordinatorName === '') {
            $coordinatorName = (string) data_get($this->resource, 'course_coordinator.name', '');
        }

        return [
            'id' => (string) data_get($this->resource, 'id'),
            'subject_id' => (string) data_get($this->resource, 'subject_id'),
            'subject_name' => $subjectName,
            'course_coordinator_id' => (string) data_get($this->resource, 'course_coordinator_id'),
            'course_coordinator_name' => $coordinatorName,
            'batch' => (string) data_get($this->resource, 'batch'),
            'room_no' => (string) data_get($this->resource, 'room_no'),
        ];
    }
}
