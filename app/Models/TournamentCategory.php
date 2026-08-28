<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use Database\Factories\TournamentCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TournamentCategory extends Model
{
    /** @use HasFactory<TournamentCategoryFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'event_id',
        'ruleset_id',
        'name',
        'slug',
        'min_age',
        'max_age',
        'max_participants',
        'format',
        'stage_config',
        'deck_lock_policy',
        'tie_breaker_priority',
        'call_timeout_seconds',
        'target_points',
    ];

    protected function casts(): array
    {
        return [
            'min_age' => 'integer',
            'max_age' => 'integer',
            'max_participants' => 'integer',
            'format' => EventFormatEnum::class,
            'stage_config' => 'array',
            'deck_lock_policy' => DeckLockPolicyEnum::class,
            'tie_breaker_priority' => 'array',
            'call_timeout_seconds' => 'integer',
            'target_points' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function ruleset(): BelongsTo
    {
        return $this->belongsTo(TournamentRuleset::class, 'ruleset_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'category_id');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'category_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'format', 'max_participants', 'deck_lock_policy', 'target_points'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
