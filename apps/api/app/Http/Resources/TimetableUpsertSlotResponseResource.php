<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TimetableUpsertSlotResponse')]
class TimetableUpsertSlotResponseResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'message' => (string) data_get($this->resource, 'message'),
            'data' => TimetableSlotResource::make(data_get($this->resource, 'data')),
        ];
    }
}
