<?php

namespace App\Services;

use App\Enums\MatchStatusEnum;
use App\Models\Registration;
use App\Models\TournamentMatch;

class MatchSchedulingConflictService
{
    /**
     * Check if any of the players in a match are currently active in another match.
     *
     * @return array|null Null if no conflict, or array with conflict details.
     */
    public function checkConflict(TournamentMatch $match): ?array
    {
        $activeStatuses = [
            MatchStatusEnum::CALLED->value,
            MatchStatusEnum::IN_PROGRESS->value,
        ];

        $regIds = array_filter([$match->player1_id, $match->player2_id]);

        if (empty($regIds)) {
            return null;
        }

        // Get user_ids of the players
        $userIds = Registration::whereIn('id', $regIds)->pluck('user_id')->filter()->toArray();

        if (empty($userIds)) {
            return null;
        }

        $conflictingMatch = TournamentMatch::where('id', '!=', $match->id)
            ->whereIn('status', $activeStatuses)
            ->where(function ($q) use ($userIds) {
                $q->whereHas('player1', fn ($sub) => $sub->whereIn('user_id', $userIds))
                    ->orWhereHas('player2', fn ($sub) => $sub->whereIn('user_id', $userIds));
            })
            ->with(['stadium', 'category'])
            ->first();

        if ($conflictingMatch) {
            return [
                'has_conflict' => true,
                'match_id' => $conflictingMatch->id,
                'stadium_name' => $conflictingMatch->stadium?->name ?? 'Arena Lain',
                'category_name' => $conflictingMatch->category?->name ?? 'Divisi Lain',
            ];
        }

        return null;
    }
}
