<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

class CalculateRoundRobinStandingsAction
{
    /**
     * Calculate round-robin standings with 5-level tie-breaker hierarchy.
     *
     * @return Collection<int, array>
     */
    public function execute(TournamentCategory $category, ?string $groupCode = null): Collection
    {
        $matchesQuery = TournamentMatch::where('category_id', $category->id)
            ->where('status', MatchStatusEnum::COMPLETED);

        if ($groupCode) {
            $matchesQuery->where('group_code', $groupCode);
        }

        $matches = $matchesQuery->get();

        // 1. Collect all participating registrations in this group/category
        $allMatchesQuery = TournamentMatch::where('category_id', $category->id);
        if ($groupCode) {
            $allMatchesQuery->where('group_code', $groupCode);
        }
        $allMatches = $allMatchesQuery->get();

        $registrationIds = $allMatches->pluck('player1_id')
            ->merge($allMatches->pluck('player2_id'))
            ->filter()
            ->unique()
            ->values();

        $registrations = Registration::with('user:id,name')->whereIn('id', $registrationIds)->get()->keyBy('id');

        // 2. Initialize statistics table
        $stats = [];
        foreach ($registrationIds as $id) {
            $reg = $registrations[$id] ?? null;
            $stats[$id] = [
                'registration_id' => $id,
                'user_id' => $reg?->user_id ?? $id,
                'user_name' => $reg?->display_nickname ?? $reg?->user?->name ?? 'Blader',
                'mp' => 0,          // Matches Played
                'w' => 0,           // Wins
                'd' => 0,           // Draws
                'l' => 0,           // Losses
                'points' => 0,      // Match Points (Win=3, Draw=1, Loss=0)
                'bp_for' => 0,      // Battle Points Scored
                'bp_against' => 0,  // Battle Points Conceded
                'bp_diff' => 0,     // Battle Point Differential
                'penalties' => 0,   // Penalties conceded
            ];
        }

        // 3. Accumulate scores from completed matches
        $h2h = [];

        foreach ($matches as $match) {
            $p1 = $match->player1_id;
            $p2 = $match->player2_id;
            $s1 = (int) $match->player1_score;
            $s2 = (int) $match->player2_score;

            if (! isset($stats[$p1]) || ! isset($stats[$p2])) {
                continue;
            }

            $stats[$p1]['mp']++;
            $stats[$p2]['mp']++;

            $stats[$p1]['bp_for'] += $s1;
            $stats[$p1]['bp_against'] += $s2;
            $stats[$p2]['bp_for'] += $s2;
            $stats[$p2]['bp_against'] += $s1;

            if ($s1 > $s2) {
                $stats[$p1]['w']++;
                $stats[$p1]['points'] += 3;
                $stats[$p2]['l']++;
                $h2h[$p1][$p2] = $p1;
                $h2h[$p2][$p1] = $p1;
            } elseif ($s2 > $s1) {
                $stats[$p2]['w']++;
                $stats[$p2]['points'] += 3;
                $stats[$p1]['l']++;
                $h2h[$p1][$p2] = $p2;
                $h2h[$p2][$p1] = $p2;
            } else {
                $stats[$p1]['d']++;
                $stats[$p1]['points'] += 1;
                $stats[$p2]['d']++;
                $stats[$p2]['points'] += 1;
                $h2h[$p1][$p2] = 'draw';
                $h2h[$p2][$p1] = 'draw';
            }
        }

        // Calculate differential and points frequency
        $pointsCount = [];
        foreach ($stats as $id => $data) {
            $diff = $data['bp_for'] - $data['bp_against'];
            $stats[$id]['bp_diff'] = $diff;

            $pts = $data['points'];
            $pointsCount[$pts] = ($pointsCount[$pts] ?? 0) + 1;
        }

        // 4. Sort standings using 5-level tie-breaker hierarchy
        $standingsList = array_values($stats);

        usort($standingsList, function ($a, $b) use ($h2h, $pointsCount) {
            // Level 1: Match Points (descending)
            if ($a['points'] !== $b['points']) {
                return $b['points'] <=> $a['points'];
            }

            $p1 = $a['registration_id'];
            $p2 = $b['registration_id'];
            $isTwoWayTie = (($pointsCount[$a['points']] ?? 0) === 2);

            // Level 2: If exactly 2 players are tied on points, use Head-to-Head first
            if ($isTwoWayTie && isset($h2h[$p1][$p2]) && $h2h[$p1][$p2] !== 'draw') {
                return ($h2h[$p1][$p2] === $p1) ? -1 : 1;
            }

            // Level 3: Battle Point Differential (descending)
            if ($a['bp_diff'] !== $b['bp_diff']) {
                return $b['bp_diff'] <=> $a['bp_diff'];
            }

            // Level 4: Battle Points Scored (descending)
            if ($a['bp_for'] !== $b['bp_for']) {
                return $b['bp_for'] <=> $a['bp_for'];
            }

            // Level 5: Head-to-head for remaining multi-way tied pairs
            if (isset($h2h[$p1][$p2]) && $h2h[$p1][$p2] !== 'draw') {
                return ($h2h[$p1][$p2] === $p1) ? -1 : 1;
            }

            // Level 6: Fewest Penalties (ascending)
            if ($a['penalties'] !== $b['penalties']) {
                return $a['penalties'] <=> $b['penalties'];
            }

            return strcmp($a['registration_id'], $b['registration_id']);
        });

        // Add 1-indexed rank
        foreach ($standingsList as $index => $item) {
            $standingsList[$index]['rank'] = $index + 1;
        }

        return collect($standingsList);
    }
}
