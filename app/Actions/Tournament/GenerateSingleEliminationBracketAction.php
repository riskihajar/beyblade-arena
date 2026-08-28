<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class GenerateSingleEliminationBracketAction
{
    /**
     * Generate a Single Elimination tournament bracket for a category.
     *
     * @throws ValidationException
     * @return Collection<int, TournamentMatch>
     */
    public function execute(TournamentCategory $category, bool $useOnlyCheckedIn = true): Collection
    {
        // 1. Fetch eligible registrations
        $statusFilter = $useOnlyCheckedIn
            ? [RegistrationStatusEnum::CHECKED_IN->value]
            : [RegistrationStatusEnum::CHECKED_IN->value, RegistrationStatusEnum::CONFIRMED->value];

        $registrations = Registration::where('category_id', $category->id)
            ->whereIn('status', $statusFilter)
            ->orderByRaw('seed_number IS NULL, seed_number ASC')
            ->get();

        $participantCount = $registrations->count();

        if ($participantCount < 2) {
            throw ValidationException::withMessages([
                'category' => 'Minimal 2 peserta yang siap/checked-in diperlukan untuk membuat bagan turnamen.',
            ]);
        }

        // 2. Delete existing matches if bracket is not locked
        TournamentMatch::where('category_id', $category->id)->delete();

        // 3. Determine Bracket Size (Next power of 2)
        $bracketSize = 1;
        while ($bracketSize < $participantCount) {
            $bracketSize *= 2;
        }

        $totalRounds = (int) log($bracketSize, 2);

        // 4. Generate standard seeded seed order array
        $seedOrder = $this->getSeededOrder($bracketSize);

        // 5. Map participants to seed positions (1-indexed seeds)
        $bladerAtSeed = [];
        foreach ($registrations as $idx => $reg) {
            $bladerAtSeed[$idx + 1] = $reg;
        }

        // 6. Create matches structure from Final down to Round 1
        $matchesByRound = [];
        $stageConfig = $category->stage_config ?? [];
        $hasThirdPlace = ! empty($stageConfig['has_third_place_match']);

        $matchOrderCounter = 1;

        // Create Round 1 to Final matches
        for ($round = 1; $round <= $totalRounds; $round++) {
            $matchesInRound = $bracketSize / (2 ** $round);
            $matchesByRound[$round] = [];

            for ($m = 1; $m <= $matchesInRound; $m++) {
                $isFinal = ($round === $totalRounds);
                $bracketType = $isFinal ? 'finals' : 'winners';

                $match = TournamentMatch::create([
                    'category_id' => $category->id,
                    'round_number' => $round,
                    'match_order' => $matchOrderCounter++,
                    'bracket_position' => $m,
                    'bracket_type' => $bracketType,
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

                $matchesByRound[$round][$m] = $match;
            }
        }

        // Optional: Create 3rd place match
        if ($hasThirdPlace && $totalRounds >= 2) {
            TournamentMatch::create([
                'category_id' => $category->id,
                'round_number' => $totalRounds,
                'match_order' => $matchOrderCounter++,
                'bracket_position' => 2,
                'bracket_type' => 'bronze',
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
        }

        // 7. Link next_match_id pointers
        for ($round = 1; $round < $totalRounds; $round++) {
            $matchesInRound = count($matchesByRound[$round]);
            for ($m = 1; $m <= $matchesInRound; $m++) {
                $nextMatchIndex = (int) ceil($m / 2);
                $nextMatch = $matchesByRound[$round + 1][$nextMatchIndex] ?? null;

                if ($nextMatch) {
                    $matchesByRound[$round][$m]->update([
                        'next_match_id' => $nextMatch->id,
                    ]);
                }
            }
        }

        // 8. Place Registrations into Round 1 matches and resolve Byes
        $round1Matches = $matchesByRound[1];

        foreach ($round1Matches as $mIndex => $match) {
            $seed1 = $seedOrder[($mIndex - 1) * 2];
            $seed2 = $seedOrder[($mIndex - 1) * 2 + 1];

            $reg1 = $bladerAtSeed[$seed1] ?? null;
            $reg2 = $bladerAtSeed[$seed2] ?? null;

            $reg1Id = $reg1?->id;
            $reg2Id = $reg2?->id;

            // Check for Bye
            if ($reg1Id && ! $reg2Id) {
                // Player 1 has a Bye -> Auto win and advance
                $match->update([
                    'player1_id' => $reg1Id,
                    'player2_id' => null,
                    'winner_id' => $reg1Id,
                    'status' => MatchStatusEnum::COMPLETED,
                    'player1_score' => 0,
                    'player2_score' => 0,
                ]);

                $this->advanceWinnerToNextMatch($match, $reg1Id);
            } elseif (! $reg1Id && $reg2Id) {
                // Player 2 has a Bye -> Auto win and advance
                $match->update([
                    'player1_id' => null,
                    'player2_id' => $reg2Id,
                    'winner_id' => $reg2Id,
                    'status' => MatchStatusEnum::COMPLETED,
                    'player1_score' => 0,
                    'player2_score' => 0,
                ]);

                $this->advanceWinnerToNextMatch($match, $reg2Id);
            } else {
                $match->update([
                    'player1_id' => $reg1Id,
                    'player2_id' => $reg2Id,
                    'status' => MatchStatusEnum::SCHEDULED,
                ]);
            }
        }

        return TournamentMatch::where('category_id', $category->id)->orderBy('round_number')->orderBy('match_order')->get();
    }

    /**
     * Generate tournament seeding order for balanced bracket.
     */
    public function getSeededOrder(int $size): array
    {
        $seeds = [1, 2];
        while (count($seeds) < $size) {
            $next = [];
            $sum = count($seeds) * 2 + 1;
            foreach ($seeds as $s) {
                $next[] = $s;
                $next[] = $sum - $s;
            }
            $seeds = $next;
        }

        return $seeds;
    }

    /**
     * Advance winner to next round match.
     */
    protected function advanceWinnerToNextMatch(TournamentMatch $match, string $winnerRegId): void
    {
        if (! $match->next_match_id) {
            return;
        }

        $nextMatch = TournamentMatch::find($match->next_match_id);
        if (! $nextMatch) {
            return;
        }

        // Odd bracket_position goes to player1, even goes to player2
        if ($match->bracket_position % 2 !== 0) {
            $nextMatch->update(['player1_id' => $winnerRegId]);
        } else {
            $nextMatch->update(['player2_id' => $winnerRegId]);
        }
    }
}
