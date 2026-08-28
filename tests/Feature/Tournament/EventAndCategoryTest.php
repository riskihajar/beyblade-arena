<?php

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\Season;
use App\Models\TournamentCategory;
use App\Models\TournamentRuleset;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('organizer can create a tournament event with venue details', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $season = Season::factory()->create(['is_active' => true]);

    $payload = [
        'season_id' => $season->id,
        'name' => 'Samarinda Grand Prix 2026',
        'slug' => 'samarinda-grand-prix-2026',
        'description' => 'Turnamen Akbar blader se-Kaltim',
        'venue_name' => 'Big Mall Samarinda',
        'venue_address' => 'Jl. Untung Suropati No. 99',
        'venue_city' => 'Samarinda',
        'venue_maps_url' => 'https://maps.google.com/?q=Big+Mall+Samarinda',
        'registration_start_at' => now()->toIso8601String(),
        'registration_end_at' => now()->addDays(5)->toIso8601String(),
        'event_start_at' => now()->addDays(7)->toIso8601String(),
        'event_end_at' => now()->addDays(7)->addHours(8)->toIso8601String(),
        'status' => EventStatusEnum::REGISTRATION_OPEN->value,
        'entry_fee' => 30000,
        'tier_multiplier' => 1.5,
        'is_ranking_eligible' => true,
        'rules_and_regulations' => 'Official Rules Takara Tomy',
    ];

    $response = $this->actingAs($organizer)
        ->post(route('admin.events.store'), $payload);

    $response->assertSessionHasNoErrors();
    $event = Event::where('slug', 'samarinda-grand-prix-2026')->first();
    expect($event)->not->toBeNull();
    expect($event->organizer_id)->toBe($organizer->id);
    expect($event->venue_name)->toBe('Big Mall Samarinda');

    $response->assertRedirect(route('admin.events.show', $event->id));
});

test('organizer can update their own event details', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $event = Event::factory()->create([
        'organizer_id' => $organizer->id,
        'name' => 'Old Event Name',
    ]);

    $updatePayload = [
        'name' => 'Updated Event Name 2026',
        'venue_name' => 'GOR Segiri Samarinda',
        'venue_city' => 'Samarinda',
        'registration_start_at' => now()->toIso8601String(),
        'registration_end_at' => now()->addDays(4)->toIso8601String(),
        'event_start_at' => now()->addDays(6)->toIso8601String(),
        'status' => EventStatusEnum::PUBLISHED->value,
        'entry_fee' => 20000,
        'tier_multiplier' => 1.0,
    ];

    $this->actingAs($organizer)
        ->patch(route('admin.events.update', $event->id), $updatePayload)
        ->assertRedirect(route('admin.events.show', $event->id));

    $event->refresh();
    expect($event->name)->toBe('Updated Event Name 2026');
    expect($event->venue_name)->toBe('GOR Segiri Samarinda');
});

test('organizer can add a category to their event', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $event = Event::factory()->create(['organizer_id' => $organizer->id]);
    $ruleset = TournamentRuleset::factory()->create();

    $categoryPayload = [
        'event_id' => $event->id,
        'ruleset_id' => $ruleset->id,
        'name' => 'Junior U-10 Championship',
        'slug' => 'junior-u-10',
        'min_age' => 6,
        'max_age' => 10,
        'max_participants' => 16,
        'format' => EventFormatEnum::SINGLE_ELIMINATION->value,
        'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN->value,
        'call_timeout_seconds' => 180,
        'target_points' => 4,
    ];

    $response = $this->actingAs($organizer)
        ->post(route('admin.categories.store'), $categoryPayload);

    $response->assertSessionHasNoErrors();
    $category = TournamentCategory::where('slug', 'junior-u-10')->first();
    expect($category)->not->toBeNull();
    expect($category->target_points)->toBe(4);
    expect($category->call_timeout_seconds)->toBe(180);

    $response->assertRedirect(route('admin.events.show', $event->id));
});
