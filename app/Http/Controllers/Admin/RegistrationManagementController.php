<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tournament\OverrideLockedDeckAction;
use App\Actions\Tournament\ProcessRegistrationQuotaAction;
use App\Enums\RegistrationStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Registration\OverrideDeckRequest;
use App\Http\Requests\Admin\Registration\StoreAdminRegistrationRequest;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Registration::class);

        $eventId = $request->query('event_id');
        $categoryId = $request->query('category_id');
        $status = $request->query('status');
        $search = $request->query('search');

        $events = Event::with('categories:id,event_id,name')->select('id', 'name')->latest()->get();

        $registrations = Registration::query()
            ->with([
                'event:id,name',
                'category:id,name,max_participants,deck_lock_policy',
                'user:id,name,email',
            ])
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('display_nickname', 'like', "%{$term}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/registrations/index', [
            'registrations' => $registrations,
            'events' => $events,
            'filters' => [
                'event_id' => $eventId,
                'category_id' => $categoryId,
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreAdminRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $category = TournamentCategory::findOrFail($validated['category_id']);

        $user = ! empty($validated['user_id'])
            ? User::findOrFail($validated['user_id'])
            : User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['name'],
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                ]
            );

        $guardianDetails = null;
        if (! empty($validated['guardian_name'])) {
            $guardianDetails = [
                'guardian_name' => $validated['guardian_name'],
                'guardian_phone' => $validated['guardian_phone'] ?? null,
                'relationship' => $validated['guardian_relationship'] ?? 'Orang Tua',
            ];
        }

        Registration::create([
            'event_id' => $category->event_id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'display_nickname' => $validated['display_nickname'],
            'seed_number' => $validated['seed_number'] ?? null,
            'status' => $validated['status'],
            'deck_data' => $validated['deck_data'] ?? null,
            'is_deck_locked' => $validated['is_deck_locked'] ?? false,
            'guardian_details' => $guardianDetails,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Pendaftaran manual berhasil ditambahkan!');
    }

    public function updateStatus(
        Request $request,
        Registration $registration,
        ProcessRegistrationQuotaAction $quotaAction
    ): RedirectResponse {
        $this->authorize('update', $registration);

        $request->validate([
            'status' => ['required', 'string'],
        ]);

        $newStatus = RegistrationStatusEnum::from($request->input('status'));
        $oldStatus = $registration->status;

        $registration->update(['status' => $newStatus]);

        // If a confirmed registration is cancelled or rejected, auto-promote waitlist
        if (
            ($oldStatus === RegistrationStatusEnum::CONFIRMED || $oldStatus === RegistrationStatusEnum::CHECKED_IN)
            && ($newStatus === RegistrationStatusEnum::CANCELLED || $newStatus === RegistrationStatusEnum::REJECTED || $newStatus === RegistrationStatusEnum::WITHDRAWN)
        ) {
            $quotaAction->execute($registration->category);
        }

        return back()->with('success', "Status peserta berhasil diubah ke {$newStatus->value}.");
    }

    public function overrideDeck(
        OverrideDeckRequest $request,
        Registration $registration,
        OverrideLockedDeckAction $overrideAction
    ): RedirectResponse {
        $overrideAction->execute(
            registration: $registration,
            newDeckData: $request->validated('deck_data'),
            reason: $request->validated('reason'),
            operator: $request->user()
        );

        return back()->with('success', 'Part combo deck berhasil di-override dengan catatan resmi.');
    }

    public function destroy(
        Registration $registration,
        ProcessRegistrationQuotaAction $quotaAction
    ): RedirectResponse {
        $this->authorize('delete', $registration);

        $category = $registration->category;
        $registration->delete();

        $quotaAction->execute($category);

        return back()->with('success', 'Pendaftaran peserta berhasil dihapus.');
    }
}
