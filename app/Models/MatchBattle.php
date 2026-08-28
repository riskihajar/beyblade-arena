<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\MatchFinishTypeEnum;
use Database\Factories\MatchBattleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class MatchBattle extends Model
{
    /** @use HasFactory<MatchBattleFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'match_id',
        'battle_number',
        'winner_id',
        'finish_type',
        'points_awarded',
        'player1_points_after',
        'player2_points_after',
        'is_draw',
        'notes',
        'client_request_id',
    ];

    protected function casts(): array
    {
        return [
            'battle_number' => 'integer',
            'finish_type' => MatchFinishTypeEnum::class,
            'points_awarded' => 'integer',
            'player1_points_after' => 'integer',
            'player2_points_after' => 'integer',
            'is_draw' => 'boolean',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'match_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'winner_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['battle_number', 'winner_id', 'finish_type', 'points_awarded', 'is_draw'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
