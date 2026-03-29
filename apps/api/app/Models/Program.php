<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(["name", "short_name", "intake", "institution_id"])]
class Program extends Model
{
    use HasUlids, HasFactory;

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
