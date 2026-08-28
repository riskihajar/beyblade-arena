<?php

namespace App\Http\Controllers\Public;

use App\Actions\Tournament\RegisterBladerAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreRegistrationRequest;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationPublicController extends Controller
{
    public function create(Event $event): Response
    {
        $event->load([
            'season:id,name',
            'categories.ruleset',
        ]);

        return Inertia::render('public/events/register', [
            'event' => $event,
            'user' => request()->user(),
        ]);
    }

    public function store(
        StoreRegistrationRequest $request,
        Event $event,
        RegisterBladerAction $registerBlader
    ): RedirectResponse {
        $validated = $request->validated();
        $category = TournamentCategory::where('event_id', $event->id)
            ->where('id', $validated['category_id'])
            ->firstOrFail();

        $registration = $registerBlader->execute(
            category: $category,
            data: $validated,
            currentUser: $request->user()
        );

        return redirect()
            ->route('public.events.registration-success', $registration->id)
            ->with('success', 'Pendaftaran berhasil dikirim!');
    }

    public function success(Registration $registration): Response
    {
        $registration->load([
            'event.season',
            'category.ruleset',
            'user:id,name,email',
        ]);

        return Inertia::render('public/events/registration-success', [
            'registration' => $registration,
        ]);
    }
}
