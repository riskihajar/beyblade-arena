<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tournament\CallMatchToStadiumAction;
use App\Enums\MatchStatusEnum;
use App\Enums\UserRoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Stadium\CallMatchRequest;
use App\Http\Requests\Admin\Stadium\StoreStadiumRequest;
use App\Http\Requests\Admin\Stadium\UpdateStadiumRequest;
use App\Models\Event;
use App\Models\Stadium;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StadiumController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Stadium::class);

        $eventId = $request->query('event_id');
        $events = Event::select('id', 'name')->latest()->get();
        $selectedEventId = $eventId ?: $events->first()?->id;

        $stadiums = Stadium::query()
            ->with([
                'assignedJudge:id,name,email',
                'matches' => fn ($q) => $q->whereIn('status', [MatchStatusEnum::CALLED->value, MatchStatusEnum::IN_PROGRESS->value])
                    ->with(['player1.user:id,name', 'player2.user:id,name', 'category:id,name']),
            ])
            ->when($selectedEventId, fn ($q) => $q->where('event_id', $selectedEventId))
            ->orderBy('name')
            ->get();

        $readyMatches = TournamentMatch::query()
            ->whereHas('category', fn ($q) => $q->where('event_id', $selectedEventId))
            ->where('status', MatchStatusEnum::SCHEDULED->value)
            ->whereNotNull('player1_id')
            ->whereNotNull('player2_id')
            ->with([
                'category:id,name,format,target_points',
                'player1.user:id,name',
                'player2.user:id,name',
            ])
            ->orderBy('round_number')
            ->orderBy('match_order')
            ->take(15)
            ->get();

        $judges = User::role([UserRoleEnum::JUDGE->value, UserRoleEnum::ORGANIZER->value, UserRoleEnum::ADMIN->value])
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/stadiums/index', [
            'stadiums' => $stadiums,
            'readyMatches' => $readyMatches,
            'events' => $events,
            'judges' => $judges,
            'selectedEventId' => $selectedEventId,
        ]);
    }

    public function store(StoreStadiumRequest $request): RedirectResponse
    {
        Stadium::create($request->validated());

        return back()->with('success', 'Stadium arena berhasil ditambahkan!');
    }

    public function update(UpdateStadiumRequest $request, Stadium $stadium): RedirectResponse
    {
        $stadium->update($request->validated());

        return back()->with('success', 'Data stadium berhasil diperbarui.');
    }

    public function destroy(Stadium $stadium): RedirectResponse
    {
        $this->authorize('delete', $stadium);

        $stadium->delete();

        return back()->with('success', 'Stadium arena berhasil dihapus.');
    }

    public function callMatch(
        CallMatchRequest $request,
        TournamentMatch $match,
        CallMatchToStadiumAction $callAction
    ): RedirectResponse {
        $stadium = Stadium::findOrFail($request->validated('stadium_id'));
        $judge = $request->validated('judge_id') ? User::find($request->validated('judge_id')) : null;

        $callAction->execute($match, $stadium, $judge);

        return back()->with('success', "Pertandingan Match #{$match->match_order} berhasil dipanggil ke {$stadium->name}!");
    }
}
