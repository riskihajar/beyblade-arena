<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class GenerateRoundRobinScheduleAction
{
    /**
     * Generate fair Round Robin schedule using Berger / Circle algorithm.
     *
     * @throws ValidationException
     * @return Collection<int, TournamentMatch>
     */
    public function execute(TournamentCategory $category, ?string $groupCode = null, bool $useOnlyCheckedIn = true): Collection
    {
        $statusFilter = $useOnlyCheckedIn
            ? [RegistrationStatusEnum::CHECKED_IN->value]
            : [RegistrationStatusEnum::CHECKED_IN->value, RegistrationStatusEnum::CONFIRMED->value];

        $query = Registration::where('category_id', $category->id)
            ->whereIn('status', $statusFilter);

        if ($groupCode) {
            $query->where('group_code', $groupCode);
        }

        $registrations = $query->orderByRaw('seed_number IS NULL, seed_number ASC')->get();
        $count = $registrations->count();

        if ($count < 2) {
            throw ValidationException::withMessages([
                'category' => 'Minimal 2 peserta diperlukan untuk membuat jadwal putaran Round Robin.',
            ]);
        }

        // Delete existing matches for this group/category
        $matchQuery = TournamentMatch::where('category_id', $category->id);
        if ($groupCode) {
            $matchQuery->where('group_code', $groupCode);
        }
        $matchQuery->delete();

        // Prepare participants array of Registration IDs
        $participants = $registrations->pluck('id')->toArray();

        // If odd, add a dummy bye (represented as null)
        $isOdd = (count($participants) % 2 !== 0);
        if ($isOdd) {
            $participants[] = null;
        }

        $n = count($participants);
        $totalRounds = $n - 1;
        $matchesPerRound = $n / 2;

        $createdMatches = collect();
        $matchOrder = 1;

        // Berger / Circle algorithm
        for ($round = 1; $round <= $totalRounds; $round++) {
            for ($i = 0; $i < $matchesPerRound; $i++) {
                $p1 = $participants[$i];
                $p2 = $participants[$n - 1 - $i];

                // Skip matches against dummy bye
                if ($p1 === null || $p2 === null) {
                    continue;
                }

                // Alternate home/away for balance
                $player1 = ($round % 2 === 0) ? $p2 : $p1;
                $player2 = ($round % 2 === 0) ? $p1 : $p2;

                $match = TournamentMatch::create([
                    'category_id' => $category->id,
                    'group_code' => $groupCode,
                    'round_number' => $round,
                    'match_order' => $matchOrder++,
                    'bracket_position' => $i + 1,
                    'bracket_type' => 'group',
                    'player1_id' => $player1,
                    'player2_id' => $player2,
                    'status' => MatchStatusEnum::SCHEDULED,
                    'ruleset_snapshot' => $category->ruleset ? [
                        'points_to_win' => $category->target_points,
                        'spin_finish_points' => $category->ruleset->spin_finish_points,
                        'over_finish_points' => $category->ruleset->over_finish_points,
                        'burst_finish_points' => $category->ruleset->burst_finish_points,
                        'xtreme_finish_points' => $category->ruleset->xtreme_finish_points,
                        'penalty_points' => $category->ruleset->penalty_points,
                    ] : null,
                ]);

                $createdMatches->push($match);
            }

            // Rotate array keeping index 0 fixed
            $first = $participants[0];
            $rest = array_slice($participants, 1);
            $last = array_pop($rest);
            array_unshift($rest, $last);
            $participants = array_merge([$first], $rest);
        }

        return $createdMatches;
    }
}
