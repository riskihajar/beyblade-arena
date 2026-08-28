<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tournament\ValidateRulesetModificationAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TournamentCategory\StoreTournamentCategoryRequest;
use App\Http\Requests\Admin\TournamentCategory\UpdateTournamentCategoryRequest;
use App\Models\Event;
use App\Models\TournamentCategory;
use App\Models\TournamentRuleset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TournamentCategoryController extends Controller
{
    public function create(Request $request): Response
    {
        $this->authorize('create', TournamentCategory::class);

        $eventId = $request->query('event_id');
        $event = Event::findOrFail($eventId);
        $rulesets = TournamentRuleset::all();

        return Inertia::render('admin/categories/create', [
            'event' => $event,
            'rulesets' => $rulesets,
        ]);
    }

    public function store(StoreTournamentCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.Str::lower(Str::random(4));
        }

        $category = TournamentCategory::create($validated);

        return redirect()
            ->route('admin.events.show', $category->event_id)
            ->with('success', "Kategori '{$category->name}' berhasil ditambahkan ke event!");
    }

    public function edit(TournamentCategory $category): Response
    {
        $this->authorize('update', $category);

        $category->load(['event', 'ruleset']);
        $rulesets = TournamentRuleset::all();

        return Inertia::render('admin/categories/edit', [
            'category' => $category,
            'event' => $category->event,
            'rulesets' => $rulesets,
        ]);
    }

    public function update(
        UpdateTournamentCategoryRequest $request,
        TournamentCategory $category,
        ValidateRulesetModificationAction $validateRulesetModification
    ): RedirectResponse {
        // If ruleset or target points are changing, validate immutability
        if ($request->filled('ruleset_id') && $request->input('ruleset_id') !== $category->ruleset_id) {
            $validateRulesetModification->execute($category);
        }

        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.Str::lower(Str::random(4));
        }

        $category->update($validated);

        return redirect()
            ->route('admin.events.show', $category->event_id)
            ->with('success', "Kategori '{$category->name}' berhasil diperbarui!");
    }

    public function destroy(
        TournamentCategory $category,
        ValidateRulesetModificationAction $validateRulesetModification
    ): RedirectResponse {
        $this->authorize('delete', $category);

        $validateRulesetModification->execute($category);

        $eventId = $category->event_id;
        $category->delete();

        return redirect()
            ->route('admin.events.show', $eventId)
            ->with('success', 'Kategori turnamen berhasil dihapus.');
    }
}
