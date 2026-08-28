<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\RegistrationStatusEnum;
use Database\Factories\RegistrationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Registration extends Model
{
    /** @use HasFactory<RegistrationFactory> */
    use HasFactory, HasUlids, LogsActivity;

    /**
     * Hidden attributes for serialization to protect junior blader PII.
     *
     * @var list<string>
     */
    protected $hidden = [
        'guardian_details',
    ];

    protected $fillable = [
        'event_id',
        'category_id',
        'user_id',
        'display_nickname',
        'seed_number',
        'group_code',
        'status',
        'deck_data',
        'is_deck_locked',
        'guardian_details',
        'checked_in_at',
        'disqualified_reason',
    ];

    protected function casts(): array
    {
        return [
            'seed_number' => 'integer',
            'status' => RegistrationStatusEnum::class,
            'deck_data' => 'array',
            'is_deck_locked' => 'boolean',
            'guardian_details' => 'encrypted:array',
            'checked_in_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TournamentCategory::class, 'category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function matchesAsPlayer1(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'player1_id');
    }

    public function matchesAsPlayer2(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'player2_id');
    }

    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->whereIn('status', [
            RegistrationStatusEnum::CONFIRMED->value,
            RegistrationStatusEnum::CHECKED_IN->value,
        ]);
    }

    public function scopeCheckedIn(Builder $query): Builder
    {
        return $query->where('status', RegistrationStatusEnum::CHECKED_IN->value);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['display_nickname', 'status', 'is_deck_locked', 'checked_in_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
