<?php

namespace App\Http\Controllers\Judge;

use App\Actions\Tournament\CorrectMatchScoreAction;
use App\Actions\Tournament\HandleMatchDisputeAction;
use App\Actions\Tournament\HandleWalkoverAction;
use App\Actions\Tournament\RecordMatchBattleAction;
use App\Enums\MatchStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Judge\StoreBattleRequest;
use App\Models\TournamentMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JudgeConsoleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $activeMatches = TournamentMatch::query()
            ->whereIn('status', [MatchStatusEnum::CALLED->value, MatchStatusEnum::IN_PROGRESS->value])
            ->where(function ($q) use ($user) {
                $q->where('judge_id', $user->id)
                    ->orWhereNull('judge_id');
            })
            ->with([
                'category.event:id,name',
                'player1.user:id,name',
                'player2.user:id,name',
                'stadium:id,name',
            ])
            ->orderBy('round_number')
            ->orderBy('match_order')
            ->get();

        $recentMatches = TournamentMatch::query()
            ->where('status', MatchStatusEnum::COMPLETED->value)
            ->where('judge_id', $user->id)
            ->with([
                'category.event:id,name',
                'player1.user:id,name',
                'player2.user:id,name',
                'winner.user:id,name',
                'stadium:id,name',
            ])
            ->latest('completed_at')
            ->take(10)
            ->get();

        return Inertia::render('judge/console', [
            'activeMatches' => $activeMatches,
            'recentMatches' => $recentMatches,
            'selectedMatch' => null,
        ]);
    }

    public function show(TournamentMatch $match): Response
    {
        $this->authorize('update', $match);

        $match->load([
            'category.event:id,name',
            'category.ruleset',
            'player1.user:id,name',
            'player2.user:id,name',
            'winner.user:id,name',
            'stadium:id,name',
            'battles.winner.user:id,name',
        ]);

        return Inertia::render('judge/console', [
            'activeMatches' => [],
            'recentMatches' => [],
            'selectedMatch' => $match,
        ]);
    }

    public function recordBattle(
        StoreBattleRequest $request,
        TournamentMatch $match,
        RecordMatchBattleAction $recordAction
    ): RedirectResponse {
        $recordAction->execute($match, $request->validated());

        return back()->with('success', 'Ronde battle berhasil dicatat!');
    }

    public function walkover(
        Request $request,
        TournamentMatch $match,
        HandleWalkoverAction $walkoverAction
    ): RedirectResponse {
        $this->authorize('update', $match);

        $validated = $request->validate([
            'present_player_id' => ['required', 'exists:registrations,id'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $walkoverAction->execute(
            match: $match,
            presentPlayerId: $validated['present_player_id'],
            reason: $validated['reason'],
            judge: $request->user()
        );

        return back()->with('success', 'Walkover (WO) berhasil ditetapkan.');
    }

    public function dispute(
        Request $request,
        TournamentMatch $match,
        HandleMatchDisputeAction $disputeAction
    ): RedirectResponse {
        $this->authorize('update', $match);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $disputeAction->execute($match, $validated['reason'], $request->user());

        return back()->with('success', 'Status sengketa (Dispute) berhasil dilaporkan ke Head Judge.');
    }

    public function correctScore(
        Request $request,
        TournamentMatch $match,
        CorrectMatchScoreAction $correctAction
    ): RedirectResponse {
        $this->authorize('update', $match);

        $validated = $request->validate([
            'player1_score' => ['required', 'integer', 'min:0', 'max:10'],
            'player2_score' => ['required', 'integer', 'min:0', 'max:10'],
            'winner_id' => ['nullable', 'exists:registrations,id'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $correctAction->execute(
            match: $match,
            player1Score: $validated['player1_score'],
            player2Score: $validated['player2_score'],
            winnerId: $validated['winner_id'] ?? null,
            reason: $validated['reason'],
            operator: $request->user()
        );

        return back()->with('success', 'Skor pertandingan berhasil dikoreksi.');
    }
}
