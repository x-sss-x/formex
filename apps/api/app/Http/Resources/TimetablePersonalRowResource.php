<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TimetablePersonalRow')]
class TimetablePersonalRowResource extends JsonResource
{
    /**
     * @return array{
     *   sl_no:int,
     *   program_name:string,
     *   semester:int,
     *   course_name:string,
     *   no_of_students:int,
     *   room_no:string,
     *   day_slots:array<string, array<int, bool>>
     * }
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, array<int, bool>> $daySlots */
        $daySlots = data_get($this->resource, 'day_slots', []);

        return [
            'sl_no' => (int) data_get($this->resource, 'sl_no'),
            'program_name' => (string) data_get($this->resource, 'program_name'),
            'semester' => (int) data_get($this->resource, 'semester'),
            'course_name' => (string) data_get($this->resource, 'course_name'),
            'no_of_students' => (int) data_get($this->resource, 'no_of_students'),
            'room_no' => (string) data_get($this->resource, 'room_no'),
            'day_slots' => $daySlots,
        ];
    }
}
