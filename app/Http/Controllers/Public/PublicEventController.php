<?php

namespace App\Http\Controllers\Public;

use App\Actions\Tournament\CalculateRoundRobinStandingsAction;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\MatchBattle;
use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    /**
     * Community homepage & welcome screen.
     */
    public function welcome(): Response
    {
        $upcomingEvents = Event::query()
            ->whereIn('status', [EventStatusEnum::PUBLISHED->value, EventStatusEnum::REGISTRATION_OPEN->value, EventStatusEnum::ONGOING->value])
            ->with(['categories'])
            ->orderBy('event_date')
            ->take(4)
            ->get();

        $activeSeason = Season::where('is_active', true)->first();
        $topRankings = [];

        if ($activeSeason) {
            $topRankings = SeasonRanking::where('season_id', $activeSeason->id)
                ->with('user:id,name')
                ->orderBy('rank')
                ->take(5)
                ->get();
        }

        return Inertia::render('welcome', [
            'upcomingEvents' => $upcomingEvents,
            'activeSeason' => $activeSeason,
            'topRankings' => $topRankings,
        ]);
    }

    /**
     * Public Event details page.
     */
    public function show(Event $event): Response
    {
        $event->load([
            'categories.ruleset',
            'categories.registrations' => fn ($q) => $q->select('id', 'category_id', 'status'),
        ]);

        return Inertia::render('public/events/show', [
            'event' => $event,
        ]);
    }

    /**
     * Public Live Hub with 4 interactive tabs.
     */
    public function liveHub(Request $request, Event $event, CalculateRoundRobinStandingsAction $standingsAction): Response
    {
        $event->load(['categories.ruleset']);

        $selectedCategoryId = $request->query('category_id') ?: $event->categories->first()?->id;
        $selectedCategory = $event->categories->firstWhere('id', $selectedCategoryId) ?? $event->categories->first();

        // 1. Stadium Call Board
        $stadiums = Stadium::where('event_id', $event->id)
            ->with([
                'assignedJudge:id,name',
                'matches' => fn ($q) => $q->whereIn('status', [MatchStatusEnum::CALLED->value, MatchStatusEnum::IN_PROGRESS->value])
                    ->with(['player1.user:id,name', 'player2.user:id,name', 'category:id,name']),
            ])
            ->orderBy('name')
            ->get();

        // 2. Category Matches (for Bracket or Round Robin)
        $matches = [];
        $standings = null;

        if ($selectedCategory) {
            $matches = TournamentMatch::where('category_id', $selectedCategory->id)
                ->with([
                    'player1.user:id,name',
                    'player2.user:id,name',
                    'winner.user:id,name',
                    'stadium:id,name',
                    'battles',
                ])
                ->orderBy('round_number')
                ->orderBy('match_order')
                ->get();

            if ($selectedCategory->format === EventFormatEnum::ROUND_ROBIN) {
                $standings = $standingsAction->execute($selectedCategory);
            }
        }

        // 3. Live Calling Queue
        $upcomingCalls = TournamentMatch::whereHas('category', fn ($q) => $q->where('event_id', $event->id))
            ->where('status', MatchStatusEnum::CALLED->value)
            ->with(['player1.user:id,name', 'player2.user:id,name', 'stadium:id,name', 'category:id,name'])
            ->orderBy('called_at', 'desc')
            ->get();

        return Inertia::render('public/events/live-hub', [
            'event' => $event,
            'selectedCategory' => $selectedCategory,
            'stadiums' => $stadiums,
            'matches' => $matches,
            'standings' => $standings,
            'upcomingCalls' => $upcomingCalls,
        ]);
    }

    /**
     * Podium & Event Summary page.
     */
    public function podium(Event $event): Response
    {
        $event->load(['categories']);

        $categoryResults = [];
        foreach ($event->categories as $cat) {
            $matches = TournamentMatch::where('category_id', $cat->id)
                ->with(['player1.user:id,name', 'player2.user:id,name', 'winner.user:id,name'])
                ->get();

            $finalMatch = $matches->where('bracket_type', 'finals')->first()
                ?? $matches->sortByDesc('round_number')->first();

            $bronzeMatch = $matches->where('bracket_type', 'bronze')->first();

            $firstPlace = $finalMatch?->winner;
            $secondPlace = ($finalMatch && $finalMatch->winner_id)
                ? (($finalMatch->winner_id === $finalMatch->player1_id) ? $finalMatch->player2 : $finalMatch->player1)
                : null;
            $thirdPlace = $bronzeMatch?->winner;

            $totalBattles = MatchBattle::whereIn('match_id', $matches->pluck('id'))->count();
            $finishStats = MatchBattle::whereIn('match_id', $matches->pluck('id'))
                ->where('is_draw', false)
                ->selectRaw('finish_type, count(*) as count')
                ->groupBy('finish_type')
                ->pluck('count', 'finish_type')
                ->toArray();

            $categoryResults[] = [
                'category' => $cat,
                'first_place' => $firstPlace,
                'second_place' => $secondPlace,
                'third_place' => $thirdPlace,
                'total_battles' => $totalBattles,
                'finish_stats' => $finishStats,
            ];
        }

        return Inertia::render('public/events/podium', [
            'event' => $event,
            'results' => $categoryResults,
        ]);
    }

    /**
     * Community rules, guidelines & ethics page.
     */
    public function community(): Response
    {
        return Inertia::render('public/community');
    }

    /**
     * Public Season Leaderboard page.
     */
    public function leaderboard(Request $request): Response
    {
        $seasons = Season::orderBy('start_date', 'desc')->get();
        $activeSeason = Season::where('is_active', true)->first() ?: $seasons->first();

        $selectedSeasonId = $request->query('season_id') ?: $activeSeason?->id;
        $selectedSeason = $seasons->firstWhere('id', $selectedSeasonId) ?? $activeSeason;

        $rankings = [];
        if ($selectedSeason) {
            $rankings = SeasonRanking::where('season_id', $selectedSeason->id)
                ->with(['user:id,name'])
                ->orderBy('rank_position')
                ->get();
        }

        return Inertia::render('public/seasons/leaderboard', [
            'seasons' => $seasons,
            'selectedSeason' => $selectedSeason,
            'rankings' => $rankings,
        ]);
    }
}
