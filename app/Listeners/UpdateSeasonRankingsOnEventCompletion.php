<?php

namespace App\Listeners;

use App\Enums\EventStatusEnum;
use App\Events\Tournament\EventStatusChangedEvent;
use App\Services\SeasonRankingCalculatorService;

class UpdateSeasonRankingsOnEventCompletion
{
    public function __construct(
        protected SeasonRankingCalculatorService $calculator
    ) {}

    public function handle(EventStatusChangedEvent $event): void
    {
        $tournamentEvent = $event->event;

        if ($tournamentEvent->status === EventStatusEnum::COMPLETED && $tournamentEvent->is_ranking_eligible && $tournamentEvent->season_id) {
            $season = $tournamentEvent->season;
            if ($season) {
                $this->calculator->recalculate($season);
            }
        }
    }
}
