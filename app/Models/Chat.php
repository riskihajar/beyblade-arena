<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasUlids;

    protected $table = 'chats';

    protected $fillable = [
        'title',
        'provider',
        'model',
        'is_title_generated',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_title_generated' => 'boolean',
        ];
    }
}
