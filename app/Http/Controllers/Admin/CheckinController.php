<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tournament\PerformCheckinAction;
use App\Actions\Tournament\ProcessRegistrationQuotaAction;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckinController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Registration::class);

        $eventId = $request->query('event_id');
        $categoryId = $request->query('category_id');
        $search = $request->query('search');

        $events = Event::with('categories:id,event_id,name')->select('id', 'name')->latest()->get();

        $selectedEventId = $eventId ?: $events->first()?->id;

        $registrations = Registration::query()
            ->with([
                'event:id,name',
                'category:id,name,max_participants,deck_lock_policy',
                'user:id,name,email',
            ])
            ->when($selectedEventId, fn ($q) => $q->where('event_id', $selectedEventId))
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('display_nickname', 'like', "%{$term}%")
                        ->orWhere('id', 'like', "%{$term}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%"));
                });
            })
            ->orderByRaw("CASE 
                WHEN status = 'confirmed' THEN 1 
                WHEN status = 'checked_in' THEN 2 
                WHEN status = 'waitlisted' THEN 3 
                ELSE 4 
            END")
            ->orderBy('seed_number')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('admin/checkin/index', [
            'registrations' => $registrations,
            'events' => $events,
            'filters' => [
                'event_id' => $selectedEventId,
                'category_id' => $categoryId,
                'search' => $search,
            ],
        ]);
    }

    public function checkin(
        Registration $registration,
        PerformCheckinAction $checkinAction
    ): RedirectResponse {
        $this->authorize('update', $registration);

        $checkinAction->execute($registration, request()->user());

        return back()->with('success', "Peserta '{$registration->display_nickname}' berhasil di-check in!");
    }

    public function noShow(
        Registration $registration,
        PerformCheckinAction $checkinAction,
        ProcessRegistrationQuotaAction $quotaAction
    ): RedirectResponse {
        $this->authorize('update', $registration);

        $checkinAction->markNoShow($registration, $quotaAction);

        return back()->with('success', "Peserta '{$registration->display_nickname}' ditandai No-Show.");
    }

    public function promote(
        Registration $registration,
        ProcessRegistrationQuotaAction $quotaAction
    ): RedirectResponse {
        $this->authorize('update', $registration);

        $promoted = $quotaAction->execute($registration->category);

        if ($promoted) {
            return back()->with('success', "Peserta '{$promoted->display_nickname}' berhasil dipromosikan dari Waitlist!");
        }

        return back()->with('error', 'Kuota kategori masih penuh.');
    }
}
