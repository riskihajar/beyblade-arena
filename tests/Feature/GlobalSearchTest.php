<?php

use App\Models\Activity;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // Use collection driver for tests to avoid Typesense dependency
    config(['scout.driver' => 'collection']);
});

test('global search groups are shared for authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('globalSearch.groups', 2)
            ->where('globalSearch.groups.0.label', 'Main')
            ->where('globalSearch.groups.1.label', 'Settings')
        );
});

test('admin users receive admin search group', function () {
    Role::firstOrCreate(['name' => 'admin']);
    Permission::firstOrCreate(['name' => 'admin.access']);

    $user = User::factory()->create();
    $user->assignRole('admin');
    $user->givePermissionTo('admin.access');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('globalSearch.groups', 3)
            ->where('globalSearch.groups.2.label', 'Admin')
            ->has('globalSearch.groups.2.items', 3)
        );
});

test('global search API returns empty results for short queries', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('global-search', ['q' => 'a']))
        ->assertOk()
        ->assertJson(['results' => []]);
});

test('global search API returns empty results for empty query', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('global-search'))
        ->assertOk()
        ->assertJson(['results' => []]);
});

test('global search API searches users', function () {
    $user = User::factory()->create(['name' => 'John Doe']);
    User::factory()->create(['name' => 'Jane Smith']);

    $this->actingAs($user)
        ->getJson(route('global-search', ['q' => 'john']))
        ->assertOk()
        ->assertJsonPath('results.0.type', 'users')
        ->assertJsonPath('results.0.label', 'Users')
        ->assertJsonPath('results.0.items.0.label', 'John Doe');
});

test('global search API does not return activities for non-admin users', function () {
    $user = User::factory()->create();

    // Create an activity
    activity()->log('Test activity for search');

    $this->actingAs($user)
        ->getJson(route('global-search', ['q' => 'test']))
        ->assertOk()
        ->assertJsonMissing(['type' => 'activities']);
});

test('global search API returns activities for admin users', function () {
    Role::firstOrCreate(['name' => 'admin']);
    Permission::firstOrCreate(['name' => 'admin.access']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $admin->givePermissionTo('admin.access');

    // Create an activity
    activity()->log('Important activity for search');

    $this->actingAs($admin)
        ->getJson(route('global-search', ['q' => 'important']))
        ->assertOk()
        ->assertJsonPath('results.0.type', 'activities')
        ->assertJsonPath('results.0.label', 'Activities');
});

test('global search API requires authentication', function () {
    $this->getJson(route('global-search', ['q' => 'test']))
        ->assertUnauthorized();
});
