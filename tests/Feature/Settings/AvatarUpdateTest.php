<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('avatar upload page is accessible', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('avatar can be uploaded', function () {
    Storage::fake('rustfs');

    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->image('avatar.jpg', 500, 500)->size(100);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'))
        ->assertSessionHas('status', 'avatar-updated');

    $user->refresh();

    expect($user->avatar_path)->not->toBeNull();
    expect($user->avatar_path)->toContain('avatars/'.$user->id);
    expect($user->avatar_path)->toContain('avatar.jpg');

    Storage::disk('rustfs')->assertExists($user->avatar_path);
});

test('avatar upload requires an image', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $file,
        ]);

    $response->assertSessionHasErrors('avatar');
});

test('avatar upload validates minimum dimensions', function () {
    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->image('avatar.jpg', 50, 50)->size(100);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response->assertSessionHasErrors('avatar');
});

test('avatar upload validates maximum dimensions', function () {
    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->image('avatar.jpg', 2000, 2000)->size(500);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response->assertSessionHasErrors('avatar');
});

test('avatar upload validates maximum file size', function () {
    $user = User::factory()->create();

    // Create file larger than max (2048 KB = 2MB)
    $avatar = UploadedFile::fake()->image('avatar.jpg', 500, 500)->size(3000);

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response->assertSessionHasErrors('avatar');
    expect($user->fresh()->avatar_path)->toBeNull();
});

test('old avatar is deleted when uploading new one', function () {
    Storage::fake('rustfs');

    $user = User::factory()->create();

    // Upload first avatar (jpg)
    $oldAvatar = UploadedFile::fake()->image('old-avatar.jpg', 500, 500)->size(100);
    $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $oldAvatar,
        ]);

    $user->refresh();
    $oldPath = $user->avatar_path;

    expect($oldPath)->not->toBeNull();
    expect($oldPath)->toContain('avatar.jpg');
    expect(Storage::disk('rustfs')->exists($oldPath))->toBeTrue();

    // Upload new avatar with different extension (png) so path changes
    $newAvatar = UploadedFile::fake()->image('new-avatar.png', 500, 500)->size(100);
    $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $newAvatar,
        ]);

    $user->refresh();
    $newPath = $user->avatar_path;

    // Old avatar should be deleted
    expect(Storage::disk('rustfs')->exists($oldPath))->toBeFalse();

    // New avatar should exist with new path
    expect($newPath)->not->toBeNull();
    expect($newPath)->toContain('avatar.png');
    expect(Storage::disk('rustfs')->exists($newPath))->toBeTrue();
});

test('avatar upload accepts valid image formats', function (string $extension) {
    Storage::fake('rustfs');

    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->image("avatar.{$extension}", 500, 500)->size(100);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response->assertSessionHasNoErrors();

    $user->refresh();
    expect($user->avatar_path)->not->toBeNull();
})->with([
    'jpeg' => 'jpeg',
    'jpg' => 'jpg',
    'png' => 'png',
    'gif' => 'gif',
]);

test('avatar upload rejects invalid formats', function (string $extension) {
    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->create("avatar.{$extension}", 100);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response->assertSessionHasErrors('avatar');
})->with([
    'pdf' => 'pdf',
    'txt' => 'txt',
    'webp' => 'webp',
]);

test('avatar can be deleted', function () {
    Storage::fake('rustfs');

    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->image('avatar.jpg', 500, 500)->size(100);
    $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    expect($user->fresh()->avatar_path)->not->toBeNull();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.avatar.delete'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'))
        ->assertSessionHas('status', 'avatar-deleted');

    expect($user->fresh()->avatar_path)->toBeNull();
});

test('correct password must be provided to delete avatar', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.avatar.delete'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));
});

test('guest cannot upload avatar', function () {
    $avatar = UploadedFile::fake()->image('avatar.jpg', 500, 500)->size(100);

    $response = $this
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $response->assertRedirect(route('login'));
});

test('guest cannot delete avatar', function () {
    $response = $this
        ->delete(route('profile.avatar.delete'), [
            'password' => 'password',
        ]);

    $response->assertRedirect(route('login'));
});

test('avatar url accessor returns null when no avatar', function () {
    $user = User::factory()->create([
        'avatar_path' => null,
    ]);

    expect($user->avatar_url)->toBeNull();
});

test('avatar url accessor returns url when avatar exists', function () {
    Storage::fake('rustfs');

    $user = User::factory()->create();

    $avatar = UploadedFile::fake()->image('avatar.jpg', 500, 500)->size(100);
    $this
        ->actingAs($user)
        ->patch(route('profile.avatar.update'), [
            'avatar' => $avatar,
        ]);

    $user->refresh();

    expect($user->avatar_url)->not->toBeNull();
    expect($user->avatar_url)->toContain($user->avatar_path);
});
