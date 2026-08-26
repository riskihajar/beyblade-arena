<?php

use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Notifications\DatabaseNotification;

test('user can mark their notification as read', function () {
    $user = User::factory()->createOne();

    $user->notify(new SystemNotification('Test notification'));

    /** @var DatabaseNotification $notification */
    $notification = $user->fresh()->notifications()->firstOrFail();

    $this->actingAs($user)
        ->post(route('notifications.read', ['notification' => $notification]))
        ->assertRedirect();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('user cannot delete another users notification', function () {
    $user = User::factory()->createOne();
    $otherUser = User::factory()->createOne();

    $otherUser->notify(new SystemNotification('Other user notification'));

    /** @var DatabaseNotification $notification */
    $notification = $otherUser->fresh()->notifications()->firstOrFail();

    $this->actingAs($user)
        ->delete(route('notifications.destroy', ['notification' => $notification]))
        ->assertNotFound();

    expect(DatabaseNotification::query()->whereKey($notification->id)->exists())->toBeTrue();
});
