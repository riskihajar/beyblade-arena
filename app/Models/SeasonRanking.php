<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Database\Factories\SeasonRankingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SeasonRanking extends Model
{
    /** @use HasFactory<SeasonRankingFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'season_id',
        'user_id',
        'total_points',
        'rank_position',
        'tournaments_played',
        'tournaments_won',
        'matches_won',
        'matches_lost',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'total_points' => 'integer',
            'rank_position' => 'integer',
            'tournaments_played' => 'integer',
            'tournaments_won' => 'integer',
            'matches_won' => 'integer',
            'matches_lost' => 'integer',
            'details' => 'array',
        ];
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'season_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['total_points', 'rank_position', 'tournaments_played', 'tournaments_won', 'matches_won'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
