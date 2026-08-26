<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        abort_unless($notification->notifiable->is($request->user()), 404);

        $notification->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    public function destroy(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        abort_unless($notification->notifiable->is($request->user()), 404);

        $notification->delete();

        return back();
    }

    public function clearAll(Request $request): RedirectResponse
    {
        $request->user()->notifications()->delete();

        return back();
    }
}
