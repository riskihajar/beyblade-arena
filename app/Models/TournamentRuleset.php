<?php

namespace App\Models;

use App\Concerns\HasUlids;
use App\Enums\MatchFinishTypeEnum;
use Database\Factories\TournamentRulesetFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TournamentRuleset extends Model
{
    /** @use HasFactory<TournamentRulesetFactory> */
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'name',
        'generation',
        'points_to_win',
        'spin_finish_points',
        'over_finish_points',
        'burst_finish_points',
        'xtreme_finish_points',
        'penalty_points',
        'custom_rules_config',
        'is_official',
    ];

    protected function casts(): array
    {
        return [
            'points_to_win' => 'integer',
            'spin_finish_points' => 'integer',
            'over_finish_points' => 'integer',
            'burst_finish_points' => 'integer',
            'xtreme_finish_points' => 'integer',
            'penalty_points' => 'integer',
            'custom_rules_config' => 'array',
            'is_official' => 'boolean',
        ];
    }

    public function categories(): HasMany
    {
        return $this->hasMany(TournamentCategory::class, 'ruleset_id');
    }

    public function getPointsForFinishType(MatchFinishTypeEnum|string $finishType): int
    {
        $type = is_string($finishType) ? MatchFinishTypeEnum::tryFrom($finishType) : $finishType;

        return match ($type) {
            MatchFinishTypeEnum::SPIN_FINISH => $this->spin_finish_points,
            MatchFinishTypeEnum::OVER_FINISH => $this->over_finish_points,
            MatchFinishTypeEnum::BURST_FINISH => $this->burst_finish_points,
            MatchFinishTypeEnum::XTREME_FINISH => $this->xtreme_finish_points,
            MatchFinishTypeEnum::PENALTY_FOUL => $this->penalty_points,
            MatchFinishTypeEnum::JUDGE_DECISION => 1,
            default => 1,
        };
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'points_to_win', 'spin_finish_points', 'over_finish_points', 'burst_finish_points', 'xtreme_finish_points'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
