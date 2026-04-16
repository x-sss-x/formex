<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TimetableSlot')]
class TimetableSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $subjects = data_get($this->resource, 'subjects', []);

        return [
            'id' => (string) data_get($this->resource, 'id'),
            'day' => (string) data_get($this->resource, 'day'),
            'start_hour_no' => (int) data_get($this->resource, 'start_hour_no'),
            'end_hour_no' => (int) data_get($this->resource, 'end_hour_no'),
            'subjects' => TimetableSlotSubjectResource::collection(collect($subjects)->values()),
        ];
    }
}
