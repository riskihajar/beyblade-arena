<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tournament\CalculateRoundRobinStandingsAction;
use App\Actions\Tournament\RegenerateBracketAction;
use App\Enums\EventFormatEnum;
use App\Http\Controllers\Controller;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BracketController extends Controller
{
    public function show(
        TournamentCategory $category,
        CalculateRoundRobinStandingsAction $standingsAction
    ): Response {
        $this->authorize('view', $category);

        $category->load(['event', 'ruleset']);

        $matches = TournamentMatch::where('category_id', $category->id)
            ->with([
                'player1.user:id,name',
                'player2.user:id,name',
                'winner.user:id,name',
                'stadium:id,name',
            ])
            ->orderBy('round_number')
            ->orderBy('match_order')
            ->get();

        $standings = null;
        if ($category->format === EventFormatEnum::ROUND_ROBIN) {
            $standings = $standingsAction->execute($category);
        }

        return Inertia::render('admin/bracket/view', [
            'category' => $category,
            'matches' => $matches,
            'standings' => $standings,
        ]);
    }

    public function generate(
        TournamentCategory $category,
        RegenerateBracketAction $action
    ): RedirectResponse {
        $this->authorize('update', $category);

        $action->execute($category);

        return back()->with('success', 'Bagan turnamen berhasil dibuat!');
    }

    public function regenerate(
        Request $request,
        TournamentCategory $category,
        RegenerateBracketAction $action
    ): RedirectResponse {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'force' => ['boolean'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $action->execute(
            category: $category,
            force: $validated['force'] ?? false,
            reason: $validated['reason'] ?? null,
            operator: $request->user()
        );

        return back()->with('success', 'Bagan turnamen berhasil diregenerasi.');
    }
}
