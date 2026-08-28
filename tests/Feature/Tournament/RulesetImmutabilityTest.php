<?php

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentRuleset;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('category ruleset can be updated freely when matches are still scheduled', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $event = Event::factory()->create(['organizer_id' => $organizer->id]);
    $rulesetA = TournamentRuleset::factory()->create(['points_to_win' => 4]);
    $rulesetB = TournamentRuleset::factory()->create(['points_to_win' => 7]);

    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'ruleset_id' => $rulesetA->id,
        'target_points' => 4,
    ]);

    TournamentMatch::factory()->create([
        'category_id' => $category->id,
        'status' => MatchStatusEnum::SCHEDULED,
    ]);

    $response = $this->actingAs($organizer)
        ->patch(route('admin.categories.update', $category->id), [
            'ruleset_id' => $rulesetB->id,
            'name' => $category->name,
            'max_participants' => 32,
            'format' => EventFormatEnum::SINGLE_ELIMINATION->value,
            'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN->value,
            'call_timeout_seconds' => 180,
            'target_points' => 7,
        ]);

    $response->assertSessionHasNoErrors();
    $category->refresh();
    expect($category->ruleset_id)->toBe($rulesetB->id);
    expect($category->target_points)->toBe(7);
});

test('category ruleset modification is strictly rejected once a match is active or completed', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $event = Event::factory()->create(['organizer_id' => $organizer->id]);
    $rulesetA = TournamentRuleset::factory()->create(['points_to_win' => 4]);
    $rulesetB = TournamentRuleset::factory()->create(['points_to_win' => 7]);

    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'ruleset_id' => $rulesetA->id,
        'target_points' => 4,
    ]);

    TournamentMatch::factory()->create([
        'category_id' => $category->id,
        'status' => MatchStatusEnum::IN_PROGRESS, // Live battle in progress!
    ]);

    $response = $this->actingAs($organizer)
        ->patch(route('admin.categories.update', $category->id), [
            'ruleset_id' => $rulesetB->id,
            'name' => $category->name,
            'max_participants' => 32,
            'format' => EventFormatEnum::SINGLE_ELIMINATION->value,
            'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN->value,
            'call_timeout_seconds' => 180,
            'target_points' => 7,
        ]);

    $response->assertSessionHasErrors(['ruleset_id']);
    $category->refresh();
    expect($category->ruleset_id)->toBe($rulesetA->id);
});
