<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Permission::firstOrCreate(['name' => 'admin.access']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->user->givePermissionTo('admin.access');
});

test('activity details page can be rendered', function () {
    $activity = activity('admin')
        ->causedBy($this->user)
        ->performedOn($this->user)
        ->withProperties(['ip' => '127.0.0.1'])
        ->log('created');

    $this->actingAs($this->user)
        ->get(route('settings.activities.show', $activity))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/activities/show')
            ->where('activity.id', (string) $activity->id)
        );
});

test('activity logs export respects filters and sorting', function () {
    $older = activity('admin')
        ->causedBy($this->user)
        ->performedOn($this->user)
        ->withProperties(['ip' => '127.0.0.1'])
        ->event('created')
        ->log('created');

    $newer = activity('admin')
        ->causedBy($this->user)
        ->performedOn($this->user)
        ->withProperties(['ip' => '127.0.0.2'])
        ->event('updated')
        ->log('updated');

    activity('default')
        ->causedBy($this->user)
        ->performedOn($this->user)
        ->withProperties(['ip' => '127.0.0.3'])
        ->event('created')
        ->log('created');

    $older->forceFill([
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ])->save();

    $newer->forceFill([
        'created_at' => now()->subHour(),
        'updated_at' => now()->subHour(),
    ])->save();

    $this->actingAs($this->user)
        ->get(route('settings.activities.export', [
            'format' => 'json',
            'filter' => 'admin',
            'sort' => 'created_at',
            'direction' => 'asc',
        ]))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', (string) $older->id)
        ->assertJsonPath('data.0.properties.ip', '127.0.0.1')
        ->assertJsonPath('data.1.id', (string) $newer->id);
});
