<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\MatchStatusEnum;
use App\Enums\StadiumStatusEnum;
use Database\Factories\StadiumFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Stadium extends Model
{
    /** @use HasFactory<StadiumFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $table = 'stadiums';

    protected $fillable = [
        'event_id',
        'assigned_judge_id',
        'name',
        'model_type',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => StadiumStatusEnum::class,
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function assignedJudge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_judge_id');
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'stadium_id');
    }

    public function currentMatch(): HasOne
    {
        return $this->hasOne(TournamentMatch::class, 'stadium_id')
            ->whereIn('status', [
                MatchStatusEnum::CALLED->value,
                MatchStatusEnum::IN_PROGRESS->value,
            ]);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', StadiumStatusEnum::AVAILABLE->value);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'assigned_judge_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
