<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Season\StoreSeasonRequest;
use App\Http\Requests\Admin\Season\UpdateSeasonRequest;
use App\Models\Season;
use App\Models\SeasonPointsAudit;
use App\Models\SeasonRanking;
use App\Services\SeasonRankingCalculatorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SeasonController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Season::class);

        $seasons = Season::query()
            ->withCount(['events', 'rankings'])
            ->latest('start_date')
            ->paginate(10);

        return Inertia::render('admin/seasons/index', [
            'seasons' => $seasons,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Season::class);

        return Inertia::render('admin/seasons/create');
    }

    public function store(StoreSeasonRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.Str::lower(Str::random(4));
        }

        if (! empty($validated['is_active'])) {
            Season::where('is_active', true)->update(['is_active' => false]);
        }

        $season = Season::create($validated);

        return redirect()
            ->route('admin.seasons.index')
            ->with('success', "Musim kompetisi '{$season->name}' berhasil dibuat!");
    }

    public function edit(Season $season): Response
    {
        $this->authorize('update', $season);

        $rankings = SeasonRanking::where('season_id', $season->id)
            ->with('user:id,name,email')
            ->orderBy('rank_position')
            ->take(50)
            ->get();

        return Inertia::render('admin/seasons/edit', [
            'season' => $season,
            'rankings' => $rankings,
        ]);
    }

    public function update(UpdateSeasonRequest $request, Season $season): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.Str::lower(Str::random(4));
        }

        if (! empty($validated['is_active'])) {
            Season::where('id', '!=', $season->id)->update(['is_active' => false]);
        }

        $season->update($validated);

        return redirect()
            ->route('admin.seasons.index')
            ->with('success', "Musim kompetisi '{$season->name}' berhasil diperbarui!");
    }

    public function destroy(Season $season): RedirectResponse
    {
        $this->authorize('delete', $season);

        if ($season->events()->exists()) {
            return back()->with('error', 'Musim tidak dapat dihapus karena masih memiliki event turnamen terdaftar.');
        }

        $season->delete();

        return redirect()
            ->route('admin.seasons.index')
            ->with('success', 'Musim kompetisi berhasil dihapus.');
    }

    public function recalculate(Season $season, SeasonRankingCalculatorService $calculator): RedirectResponse
    {
        $this->authorize('update', $season);

        $rankings = $calculator->recalculate($season);

        return back()->with('success', "Kalkulasi ranking musim berhasil diperbarui! ({$rankings->count()} blader).");
    }

    public function adjustPoints(Request $request, Season $season): RedirectResponse
    {
        $this->authorize('update', $season);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'points' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $ranking = SeasonRanking::firstOrCreate(
            ['season_id' => $season->id, 'user_id' => $validated['user_id']],
            ['total_points' => 0, 'rank_position' => 999]
        );

        $ranking->increment('total_points', $validated['points']);

        SeasonPointsAudit::create([
            'season_id' => $season->id,
            'user_id' => $validated['user_id'],
            'points_awarded' => $validated['points'],
            'reason' => "[Penyesuaian Manual oleh {$request->user()->name}] {$validated['reason']}",
            'calculation_breakdown' => ['manual' => true],
        ]);

        return back()->with('success', 'Poin berhasil disesuaikan.');
    }
}
