<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TimetablePersonal')]
class TimetablePersonalResource extends JsonResource
{
    /**
     * @return array{
     *   academic_year:int,
     *   days:list<string>,
     *   rows:list<array{
     *     sl_no:int,
     *     program_name:string,
     *     semester:int,
     *     course_name:string,
     *     no_of_students:int,
     *     room_no:string,
     *     day_slots:array<string, array<int, bool>>
     *   }>
     * }
     */
    public function toArray(Request $request): array
    {
        $rows = data_get($this->resource, 'rows', []);
        $days = data_get($this->resource, 'days', []);

        return [
            'academic_year' => (int) data_get($this->resource, 'academic_year'),
            'days' => array_values(is_array($days) ? $days : []),
            'rows' => TimetablePersonalRowResource::collection(collect($rows)->values()),
        ];
    }
}
