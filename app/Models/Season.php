<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Database\Factories\SeasonFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Season extends Model
{
    /** @use HasFactory<SeasonFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'start_date',
        'end_date',
        'formula_config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'formula_config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'season_id');
    }

    public function rankings(): HasMany
    {
        return $this->hasMany(SeasonRanking::class, 'season_id')->orderBy('rank_position');
    }

    public function pointsAudits(): HasMany
    {
        return $this->hasMany(SeasonPointsAudit::class, 'season_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'start_date', 'end_date', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
