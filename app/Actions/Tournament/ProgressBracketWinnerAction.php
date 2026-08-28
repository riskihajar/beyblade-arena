<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Models\TournamentMatch;

class ProgressBracketWinnerAction
{
    /**
     * Progress match winner (and semifinal loser for 3rd place playoff) to subsequent matches.
     */
    public function execute(TournamentMatch $match): void
    {
        if ($match->status !== MatchStatusEnum::COMPLETED || ! $match->winner_id) {
            return;
        }

        $winnerId = $match->winner_id;
        $loserId = ($match->winner_id === $match->player1_id) ? $match->player2_id : $match->player1_id;

        // 1. Progress Winner to next match
        if ($match->next_match_id) {
            $nextMatch = TournamentMatch::find($match->next_match_id);
            if ($nextMatch) {
                if ($match->bracket_position % 2 !== 0) {
                    $nextMatch->update(['player1_id' => $winnerId]);
                } else {
                    $nextMatch->update(['player2_id' => $winnerId]);
                }
            }
        }

        // 2. Check if this is a Semifinal match and 3rd place playoff exists
        if ($loserId && $match->category_id) {
            $maxRound = TournamentMatch::where('category_id', $match->category_id)
                ->where('bracket_type', '!=', 'bronze')
                ->max('round_number');

            $isSemifinal = ($maxRound && $match->round_number === $maxRound - 1);

            if ($isSemifinal) {
                $thirdPlaceMatch = TournamentMatch::where('category_id', $match->category_id)
                    ->where('bracket_type', 'bronze')
                    ->first();

                if ($thirdPlaceMatch) {
                    if ($match->bracket_position === 1) {
                        $thirdPlaceMatch->update(['player1_id' => $loserId]);
                    } else {
                        $thirdPlaceMatch->update(['player2_id' => $loserId]);
                    }
                }
            }
        }
    }
}
