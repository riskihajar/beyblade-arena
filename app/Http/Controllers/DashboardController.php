<?php

namespace App\Http\Controllers;

use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\MatchBattle;
use App\Models\Registration;
use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\Stadium;
use App\Models\TournamentMatch;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $hasBladerRole = User::query()
            ->whereHas('roles', fn ($q) => $q->where('name', UserRoleEnum::BLADER->value))
            ->exists();

        $totalBladers = $hasBladerRole
            ? User::role(UserRoleEnum::BLADER->value)->count()
            : Registration::distinct('user_id')->count();

        $stats = [
            'active_events' => Event::whereIn('status', [EventStatusEnum::ONGOING->value, EventStatusEnum::REGISTRATION_OPEN->value])->count(),
            'total_events' => Event::count(),
            'total_bladers' => $totalBladers ?: User::count(),
            'active_matches' => TournamentMatch::whereIn('status', [MatchStatusEnum::CALLED->value, MatchStatusEnum::IN_PROGRESS->value])->count(),
            'active_stadiums' => Stadium::where('status', StadiumStatusEnum::IN_USE->value)->count(),
            'total_battles' => MatchBattle::count(),
        ];

        // Active Event spotlight (Ongoing first, then Registration Open)
        $activeEvent = Event::where('status', EventStatusEnum::ONGOING->value)
            ->with([
                'categories',
                'stadiums' => function ($q) {
                    $q->with([
                        'assignedJudge:id,name',
                        'matches' => function ($mq) {
                            $mq->whereIn('status', [MatchStatusEnum::CALLED->value, MatchStatusEnum::IN_PROGRESS->value])
                                ->with(['player1.user:id,name', 'player2.user:id,name']);
                        },
                    ]);
                },
            ])
            ->latest('event_start_at')
            ->first();

        if (! $activeEvent) {
            $activeEvent = Event::where('status', EventStatusEnum::REGISTRATION_OPEN->value)
                ->with(['categories'])
                ->latest('event_start_at')
                ->first();
        }

        // Recent / Upcoming Events (5 items)
        $recentEvents = Event::with(['categories'])
            ->withCount([
                'registrations' => function ($q) {
                    $q->whereIn('status', [
                        RegistrationStatusEnum::CONFIRMED->value,
                        RegistrationStatusEnum::CHECKED_IN->value,
                    ]);
                },
            ])
            ->latest('event_start_at')
            ->take(5)
            ->get();

        // Active Season & Top 5 Rankings
        $activeSeason = Season::where('is_active', true)->first()
            ?: Season::latest('start_date')->first();

        $topRankings = $activeSeason
            ? SeasonRanking::where('season_id', $activeSeason->id)
                ->with(['user:id,name'])
                ->orderBy('rank_position')
                ->take(5)
                ->get()
            : collect();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activeEvent' => $activeEvent,
            'recentEvents' => $recentEvents,
            'activeSeason' => $activeSeason,
            'topRankings' => $topRankings,
        ]);
    }
}
