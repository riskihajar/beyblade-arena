<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Event\StoreEventRequest;
use App\Http\Requests\Admin\Event\UpdateEventRequest;
use App\Models\Event;
use App\Models\Season;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Event::class);

        $status = $request->query('status');

        $events = Event::query()
            ->with(['season:id,name', 'organizer:id,name'])
            ->withCount(['categories', 'registrations', 'stadiums'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('event_start_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/events/index', [
            'events' => $events,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Event::class);

        $seasons = Season::active()->select('id', 'name')->get();

        return Inertia::render('admin/events/create', [
            'seasons' => $seasons,
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::lower(Str::random(6));
        }

        $validated['organizer_id'] = $request->user()->id;

        $event = Event::create($validated);

        return redirect()
            ->route('admin.events.show', $event->id)
            ->with('success', 'Event turnamen berhasil dibuat!');
    }

    public function show(Event $event): Response
    {
        $this->authorize('view', $event);

        $event->load([
            'season:id,name',
            'organizer:id,name,email',
            'categories.ruleset',
            'stadiums.assignedJudge',
        ])->loadCount(['registrations']);

        return Inertia::render('admin/events/show', [
            'event' => $event,
        ]);
    }

    public function edit(Event $event): Response
    {
        $this->authorize('update', $event);

        $seasons = Season::active()->select('id', 'name')->get();

        return Inertia::render('admin/events/edit', [
            'event' => $event,
            'seasons' => $seasons,
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::lower(Str::random(6));
        }

        $event->update($validated);

        return redirect()
            ->route('admin.events.show', $event->id)
            ->with('success', 'Data event berhasil diperbarui!');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        return redirect()
            ->route('admin.events.index')
            ->with('success', 'Event turnamen berhasil dihapus.');
    }
}
