<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TournamentRuleset\StoreTournamentRulesetRequest;
use App\Http\Requests\Admin\TournamentRuleset\UpdateTournamentRulesetRequest;
use App\Models\TournamentRuleset;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TournamentRulesetController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', TournamentRuleset::class);

        $rulesets = TournamentRuleset::query()
            ->withCount('categories')
            ->orderByDesc('is_official')
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/rulesets/index', [
            'rulesets' => $rulesets,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', TournamentRuleset::class);

        return Inertia::render('admin/rulesets/create');
    }

    public function store(StoreTournamentRulesetRequest $request): RedirectResponse
    {
        $ruleset = TournamentRuleset::create($request->validated());

        return redirect()
            ->route('admin.rulesets.index')
            ->with('success', "Ruleset '{$ruleset->name}' berhasil dibuat!");
    }

    public function edit(TournamentRuleset $ruleset): Response
    {
        $this->authorize('update', $ruleset);

        return Inertia::render('admin/rulesets/edit', [
            'ruleset' => $ruleset,
        ]);
    }

    public function update(UpdateTournamentRulesetRequest $request, TournamentRuleset $ruleset): RedirectResponse
    {
        $ruleset->update($request->validated());

        return redirect()
            ->route('admin.rulesets.index')
            ->with('success', "Ruleset '{$ruleset->name}' berhasil diperbarui!");
    }

    public function destroy(TournamentRuleset $ruleset): RedirectResponse
    {
        $this->authorize('delete', $ruleset);

        if ($ruleset->categories()->exists()) {
            return back()->with('error', 'Ruleset tidak dapat dihapus karena masih digunakan oleh kategori turnamen.');
        }

        $ruleset->delete();

        return redirect()
            ->route('admin.rulesets.index')
            ->with('success', 'Ruleset berhasil dihapus.');
    }
}
