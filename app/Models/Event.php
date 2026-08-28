<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\EventStatusEnum;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $appends = [
        'banner_url',
    ];

    protected $fillable = [
        'season_id',
        'organizer_id',
        'name',
        'slug',
        'description',
        'venue_name',
        'venue_address',
        'venue_city',
        'venue_maps_url',
        'banner_path',
        'registration_start_at',
        'registration_end_at',
        'event_start_at',
        'event_end_at',
        'status',
        'entry_fee',
        'tier_multiplier',
        'is_ranking_eligible',
        'rules_and_regulations',
    ];

    protected function casts(): array
    {
        return [
            'registration_start_at' => 'datetime',
            'registration_end_at' => 'datetime',
            'event_start_at' => 'datetime',
            'event_end_at' => 'datetime',
            'status' => EventStatusEnum::class,
            'entry_fee' => 'decimal:2',
            'tier_multiplier' => 'decimal:2',
            'is_ranking_eligible' => 'boolean',
        ];
    }

    public function getBannerUrlAttribute(): ?string
    {
        if (! $this->banner_path) {
            return null;
        }

        return Storage::disk(config('filesystems.default', 'local'))->url($this->banner_path);
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'season_id');
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(TournamentCategory::class, 'event_id');
    }

    public function stadiums(): HasMany
    {
        return $this->hasMany(Stadium::class, 'event_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'event_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', '!=', EventStatusEnum::DRAFT->value);
    }

    public function scopeRegistrationOpen(Builder $query): Builder
    {
        return $query->where('status', EventStatusEnum::REGISTRATION_OPEN->value);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'status', 'event_start_at', 'venue_name', 'tier_multiplier'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
