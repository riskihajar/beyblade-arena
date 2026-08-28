<?php

namespace App\Services;

use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Season;
use App\Models\SeasonPointsAudit;
use App\Models\SeasonRanking;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SeasonRankingCalculatorService
{
    /**
     * Calculate and persist season rankings and audit logs for a given season.
     *
     * @return Collection<int, SeasonRanking>
     */
    public function recalculate(Season $season): Collection
    {
        return DB::transaction(function () use ($season) {
            $formula = $season->formula_config ?? [];
            $baseParticipation = (int) ($formula['participation_points'] ?? 10);
            $baseMatchWin = (int) ($formula['match_win_points'] ?? 5);
            $placementConfig = $formula['placement_points'] ?? [
                'first_place' => 100,
                'second_place' => 70,
                'third_place' => 50,
                'top_4' => 30,
                'top_8' => 15,
            ];

            // 1. Fetch eligible completed/ongoing events for this season
            $events = Event::where('season_id', $season->id)
                ->where('is_ranking_eligible', true)
                ->whereIn('status', [EventStatusEnum::COMPLETED->value, EventStatusEnum::ONGOING->value])
                ->with(['categories'])
                ->get();

            // 2. Initialize blader point aggregates
            $bladerStats = [];

            // Helper to get/init stats
            $getBlader = function (string $userId) use (&$bladerStats, $season) {
                if (! isset($bladerStats[$userId])) {
                    $bladerStats[$userId] = [
                        'season_id' => $season->id,
                        'user_id' => $userId,
                        'total_points' => 0,
                        'tournaments_played' => 0,
                        'tournaments_won' => 0,
                        'matches_won' => 0,
                        'matches_lost' => 0,
                        'attended_events' => [],
                        'audits' => [],
                    ];
                }

                return $bladerStats[$userId];
            };

            foreach ($events as $event) {
                $multiplier = (float) ($event->tier_multiplier ?: 1.0);

                // Participation points for checked-in or confirmed bladers
                $eventRegistrations = Registration::where('event_id', $event->id)
                    ->whereIn('status', [RegistrationStatusEnum::CHECKED_IN->value, RegistrationStatusEnum::CONFIRMED->value])
                    ->get();

                $eventUsers = $eventRegistrations->pluck('user_id')->filter()->unique();

                foreach ($eventUsers as $userId) {
                    $getBlader($userId);
                    $partPts = (int) round($baseParticipation * $multiplier);
                    $bladerStats[$userId]['total_points'] += $partPts;
                    $bladerStats[$userId]['tournaments_played']++;
                    $bladerStats[$userId]['attended_events'][] = $event->id;

                    $bladerStats[$userId]['audits'][] = [
                        'season_id' => $season->id,
                        'event_id' => $event->id,
                        'user_id' => $userId,
                        'points_awarded' => $partPts,
                        'reason' => "Poin Partisipasi Event ({$event->name} - Tier {$multiplier}x)",
                        'calculation_breakdown' => [
                            'type' => 'participation',
                            'base' => $baseParticipation,
                            'multiplier' => $multiplier,
                            'points' => $partPts,
                        ],
                    ];
                }

                // Match points and tournament champion placements
                foreach ($event->categories as $category) {
                    $matches = TournamentMatch::where('category_id', $category->id)
                        ->where('status', MatchStatusEnum::COMPLETED->value)
                        ->get();

                    $regMap = Registration::where('category_id', $category->id)->pluck('user_id', 'id');

                    foreach ($matches as $match) {
                        $p1User = $regMap[$match->player1_id] ?? null;
                        $p2User = $regMap[$match->player2_id] ?? null;
                        $winnerUser = $regMap[$match->winner_id] ?? null;

                        if ($winnerUser) {
                            $getBlader($winnerUser);
                            $winPts = (int) round($baseMatchWin * $multiplier);
                            $bladerStats[$winnerUser]['total_points'] += $winPts;
                            $bladerStats[$winnerUser]['matches_won']++;

                            $bladerStats[$winnerUser]['audits'][] = [
                                'season_id' => $season->id,
                                'event_id' => $event->id,
                                'user_id' => $winnerUser,
                                'points_awarded' => $winPts,
                                'reason' => "Kemenangan Match #{$match->match_order} ({$category->name})",
                                'calculation_breakdown' => [
                                    'type' => 'match_win',
                                    'match_id' => $match->id,
                                    'base' => $baseMatchWin,
                                    'multiplier' => $multiplier,
                                    'points' => $winPts,
                                ],
                            ];
                        }

                        $loserUser = ($winnerUser === $p1User) ? $p2User : $p1User;
                        if ($loserUser) {
                            $getBlader($loserUser);
                            $bladerStats[$loserUser]['matches_lost']++;
                        }
                    }

                    // Calculate 1st, 2nd, 3rd place bonus
                    $finalMatch = $matches->where('bracket_type', 'finals')->first()
                        ?? $matches->sortByDesc('round_number')->first();

                    $bronzeMatch = $matches->where('bracket_type', 'bronze')->first();

                    // 1st Place Champion
                    if ($finalMatch && $finalMatch->winner_id) {
                        $champUser = $regMap[$finalMatch->winner_id] ?? null;
                        if ($champUser) {
                            $getBlader($champUser);
                            $champPts = (int) round(($placementConfig['first_place'] ?? 100) * $multiplier);
                            $bladerStats[$champUser]['total_points'] += $champPts;
                            $bladerStats[$champUser]['tournaments_won']++;

                            $bladerStats[$champUser]['audits'][] = [
                                'season_id' => $season->id,
                                'event_id' => $event->id,
                                'user_id' => $champUser,
                                'points_awarded' => $champPts,
                                'reason' => "Juara 1 (Champion) {$category->name} - {$event->name}",
                                'calculation_breakdown' => [
                                    'type' => 'champion_placement',
                                    'place' => 1,
                                    'multiplier' => $multiplier,
                                    'points' => $champPts,
                                ],
                            ];
                        }

                        // 2nd Place Runner-Up
                        $runnerUpRegId = ($finalMatch->winner_id === $finalMatch->player1_id) ? $finalMatch->player2_id : $finalMatch->player1_id;
                        $runnerUpUser = $regMap[$runnerUpRegId] ?? null;
                        if ($runnerUpUser) {
                            $getBlader($runnerUpUser);
                            $secondPts = (int) round(($placementConfig['second_place'] ?? 70) * $multiplier);
                            $bladerStats[$runnerUpUser]['total_points'] += $secondPts;

                            $bladerStats[$runnerUpUser]['audits'][] = [
                                'season_id' => $season->id,
                                'event_id' => $event->id,
                                'user_id' => $runnerUpUser,
                                'points_awarded' => $secondPts,
                                'reason' => "Juara 2 (Runner-Up) {$category->name} - {$event->name}",
                                'calculation_breakdown' => [
                                    'type' => 'runner_up_placement',
                                    'place' => 2,
                                    'multiplier' => $multiplier,
                                    'points' => $secondPts,
                                ],
                            ];
                        }
                    }

                    // 3rd Place Bronze
                    if ($bronzeMatch && $bronzeMatch->winner_id) {
                        $thirdUser = $regMap[$bronzeMatch->winner_id] ?? null;
                        if ($thirdUser) {
                            $getBlader($thirdUser);
                            $thirdPts = (int) round(($placementConfig['third_place'] ?? 50) * $multiplier);
                            $bladerStats[$thirdUser]['total_points'] += $thirdPts;

                            $bladerStats[$thirdUser]['audits'][] = [
                                'season_id' => $season->id,
                                'event_id' => $event->id,
                                'user_id' => $thirdUser,
                                'points_awarded' => $thirdPts,
                                'reason' => "Juara 3 (Bronze) {$category->name} - {$event->name}",
                                'calculation_breakdown' => [
                                    'type' => 'third_place_placement',
                                    'place' => 3,
                                    'multiplier' => $multiplier,
                                    'points' => $thirdPts,
                                ],
                            ];
                        }
                    }
                }
            }

            // 3. Clear old audits and rankings for recalculation idempotency
            SeasonRanking::where('season_id', $season->id)->delete();
            SeasonPointsAudit::where('season_id', $season->id)->delete();

            // 4. Sort and assign ranks
            $rankingList = array_values($bladerStats);

            usort($rankingList, function ($a, $b) {
                // 1. Total Points (descending)
                if ($a['total_points'] !== $b['total_points']) {
                    return $b['total_points'] <=> $a['total_points'];
                }
                // 2. Tournaments Won (descending)
                if ($a['tournaments_won'] !== $b['tournaments_won']) {
                    return $b['tournaments_won'] <=> $a['tournaments_won'];
                }
                // 3. Matches Won (descending)
                if ($a['matches_won'] !== $b['matches_won']) {
                    return $b['matches_won'] <=> $a['matches_won'];
                }

                return strcmp($a['user_id'], $b['user_id']);
            });

            $savedRankings = collect();

            foreach ($rankingList as $index => $stat) {
                $rankPosition = $index + 1;

                $ranking = SeasonRanking::create([
                    'season_id' => $stat['season_id'],
                    'user_id' => $stat['user_id'],
                    'total_points' => $stat['total_points'],
                    'rank_position' => $rankPosition,
                    'tournaments_played' => $stat['tournaments_played'],
                    'tournaments_won' => $stat['tournaments_won'],
                    'matches_won' => $stat['matches_won'],
                    'matches_lost' => $stat['matches_lost'],
                    'details' => [
                        'events_count' => count(array_unique($stat['attended_events'])),
                    ],
                ]);

                $savedRankings->push($ranking);

                // Insert points audit records
                foreach ($stat['audits'] as $auditData) {
                    SeasonPointsAudit::create($auditData);
                }
            }

            return $savedRankings;
        });
    }
}
