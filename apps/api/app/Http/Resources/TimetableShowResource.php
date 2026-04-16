<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TimetableShow')]
class TimetableShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $slots = data_get($this->resource, 'slots', []);
        $id = data_get($this->resource, 'id');

        return [
            'id' => $id === null ? null : (string) $id,
            'semester' => (int) data_get($this->resource, 'semester'),
            'academic_year' => (int) data_get($this->resource, 'academic_year'),
            'slots' => TimetableSlotResource::collection(collect($slots)->values()),
        ];
    }
}
