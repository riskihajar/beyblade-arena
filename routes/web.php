<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Public\PublicEventController;
use App\Http\Controllers\Public\RegistrationPublicController;
use Laravel\Fortify\Features;

Route::get('/', [PublicEventController::class, 'welcome'])->name('home');
Route::get('community', [PublicEventController::class, 'community'])->name('community');

// Public Event Pages
Route::get('events/{event}', [PublicEventController::class, 'show'])->name('public.events.show');
Route::get('events/{event}/register', [RegistrationPublicController::class, 'create'])->name('public.events.register');
Route::post('events/{event}/register', [RegistrationPublicController::class, 'store'])->name('public.events.register.store');
Route::get('events/{event}/live', [PublicEventController::class, 'liveHub'])->name('public.events.live');
Route::get('events/{event}/podium', [PublicEventController::class, 'podium'])->name('public.events.podium');
Route::get('registrations/{registration}/success', [RegistrationPublicController::class, 'success'])->name('public.events.registration-success');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Global search
    Route::get('global-search', GlobalSearchController::class)->name('global-search');

    // Notifications
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll'])->name('notifications.clear-all');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Chat
    Route::get('chat/conversations', [ChatController::class, 'conversations'])->name('chat.conversations');
    Route::post('chat/{chat}/stream', [ChatController::class, 'stream'])->name('chat.stream');
    Route::post('chat/{chat}/upload', [ChatController::class, 'upload'])->name('chat.upload');
    Route::get('chat/{chat}/title-stream', [ChatController::class, 'titleStream'])->name('chat.title-stream');
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat', [ChatController::class, 'store'])->name('chat.store');
    Route::get('chat/{chat}', [ChatController::class, 'show'])->name('chat.show');
    Route::patch('chat/{chat}/model', [ChatController::class, 'updateModel'])->name('chat.update-model');
    Route::patch('chat/{chat}', [ChatController::class, 'update'])->name('chat.update');
    Route::delete('chat/{chat}', [ChatController::class, 'destroy'])->name('chat.destroy');
});

require __DIR__.'/admin.php';
require __DIR__.'/judge.php';
require __DIR__.'/settings.php';
