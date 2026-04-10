<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'institution_id',
    'invited_by_user_id',
    'full_name',
    'email',
    'token_hash',
    'expires_at',
    'accepted_at',
    'accepted_by_user_id',
])]
class FacultyInvitation extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }
}
