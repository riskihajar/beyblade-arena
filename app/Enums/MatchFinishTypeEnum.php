<?php

namespace App\Enums;

enum MatchFinishTypeEnum: string
{
    case SPIN_FINISH = 'spin_finish';
    case OVER_FINISH = 'over_finish';
    case BURST_FINISH = 'burst_finish';
    case XTREME_FINISH = 'xtreme_finish';
    case PENALTY_FOUL = 'penalty_foul';
    case JUDGE_DECISION = 'judge_decision';

    public function label(): string
    {
        return match ($this) {
            self::SPIN_FINISH => 'Spin Finish',
            self::OVER_FINISH => 'Over Finish',
            self::BURST_FINISH => 'Burst Finish',
            self::XTREME_FINISH => 'Xtreme Finish',
            self::PENALTY_FOUL => 'Penalti / Foul',
            self::JUDGE_DECISION => 'Keputusan Juri (Judge Decision)',
        };
    }

    public function defaultPoints(): int
    {
        return match ($this) {
            self::SPIN_FINISH => 1,
            self::OVER_FINISH => 2,
            self::BURST_FINISH => 2,
            self::XTREME_FINISH => 3,
            self::PENALTY_FOUL => 1,
            self::JUDGE_DECISION => 1,
        };
    }
}
