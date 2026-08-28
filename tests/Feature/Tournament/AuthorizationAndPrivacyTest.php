<?php

use App\Enums\UserRoleEnum;
use App\Http\Resources\PublicRegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\Request;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('regular blader without permissions cannot access admin tournament pages', function () {
    $blader = User::factory()->create();
    $blader->assignRole(UserRoleEnum::BLADER->value);

    $this->actingAs($blader)
        ->get(route('admin.events.index'))
        ->assertForbidden();

    $this->actingAs($blader)
        ->get(route('admin.events.create'))
        ->assertForbidden();

    $this->actingAs($blader)
        ->get(route('admin.rulesets.index'))
        ->assertForbidden();

    $this->actingAs($blader)
        ->get(route('admin.seasons.index'))
        ->assertForbidden();
});

test('organizer with tournament permissions can access admin tournament pages', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $this->actingAs($organizer)
        ->get(route('admin.events.index'))
        ->assertOk();

    $this->actingAs($organizer)
        ->get(route('admin.events.create'))
        ->assertOk();
});

test('admin has full access to all tournament management endpoints', function () {
    $admin = User::factory()->create();
    $admin->assignRole(UserRoleEnum::ADMIN->value);

    $this->actingAs($admin)
        ->get(route('admin.events.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.rulesets.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.seasons.index'))
        ->assertOk();
});

test('public registration resource guarantees zero leakage of guardian PII', function () {
    $user = User::factory()->create([
        'name' => 'Junior Blader Kid',
        'email' => 'kid@private-domain.test',
    ]);

    $event = Event::factory()->create();
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);

    $registration = Registration::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
        'category_id' => $category->id,
        'display_nickname' => 'DragonSlayerX',
        'guardian_details' => [
            'guardian_name' => 'Rahasia Orang Tua',
            'guardian_phone' => '081234567890',
            'relationship' => 'Ibu Kandung',
        ],
    ]);

    $resource = new PublicRegistrationResource($registration);
    $data = $resource->toArray(Request::create('/api/registrations'));

    expect($data)->toHaveKey('display_nickname');
    expect($data['display_nickname'])->toBe('DragonSlayerX');
    expect($data)->not->toHaveKey('guardian_details');
    expect($data)->not->toHaveKey('guardian_name');
    expect($data)->not->toHaveKey('guardian_phone');

    $json = json_encode($data);
    expect($json)->not->toContain('Rahasia Orang Tua');
    expect($json)->not->toContain('081234567890');
    expect($json)->not->toContain('kid@private-domain.test');
});
