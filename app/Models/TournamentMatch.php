<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\MatchStatusEnum;
use Database\Factories\TournamentMatchFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TournamentMatch extends Model
{
    /** @use HasFactory<TournamentMatchFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'category_id',
        'stadium_id',
        'judge_id',
        'round_number',
        'match_order',
        'bracket_position',
        'next_match_id',
        'group_code',
        'bracket_type',
        'player1_id',
        'player2_id',
        'winner_id',
        'player1_score',
        'player2_score',
        'status',
        'called_at',
        'started_at',
        'completed_at',
        'ruleset_snapshot',
        'is_disputed',
        'dispute_reason',
    ];

    protected function casts(): array
    {
        return [
            'round_number' => 'integer',
            'match_order' => 'integer',
            'player1_score' => 'integer',
            'player2_score' => 'integer',
            'status' => MatchStatusEnum::class,
            'called_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'ruleset_snapshot' => 'array',
            'is_disputed' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TournamentCategory::class, 'category_id');
    }

    public function stadium(): BelongsTo
    {
        return $this->belongsTo(Stadium::class, 'stadium_id');
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_id');
    }

    public function player1(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'player1_id');
    }

    public function player2(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'player2_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'winner_id');
    }

    public function battles(): HasMany
    {
        return $this->hasMany(MatchBattle::class, 'match_id')->orderBy('battle_number');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            MatchStatusEnum::CALLED->value,
            MatchStatusEnum::IN_PROGRESS->value,
        ]);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->whereIn('status', [
            MatchStatusEnum::COMPLETED->value,
            MatchStatusEnum::WALKOVER->value,
        ]);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'player1_score', 'player2_score', 'winner_id', 'is_disputed'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
