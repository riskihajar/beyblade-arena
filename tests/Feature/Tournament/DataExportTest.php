<?php

use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('admin can export event registrations CSV', function () {
    $admin = User::factory()->create();
    $admin->assignRole(UserRoleEnum::ADMIN->value);

    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);

    Registration::factory()->create([
        'event_id' => $event->id,
        'category_id' => $category->id,
        'display_nickname' => 'BladerStar',
        'status' => RegistrationStatusEnum::CONFIRMED,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.events.export-registrations', $event));

    $response->assertOk();
    $response->assertHeader('content-disposition');
});

test('admin can export tournament results CSV', function () {
    $admin = User::factory()->create();
    $admin->assignRole(UserRoleEnum::ADMIN->value);

    $event = Event::factory()->create(['status' => EventStatusEnum::COMPLETED]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);

    $r1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);
    $r2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);

    TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 1,
        'match_order' => 1,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'winner_id' => $r1->id,
        'player1_score' => 4,
        'player2_score' => 1,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.events.export-results', $event));

    $response->assertOk();
    $response->assertHeader('content-disposition');
});

test('admin can export season leaderboard CSV', function () {
    $admin = User::factory()->create();
    $admin->assignRole(UserRoleEnum::ADMIN->value);

    $season = Season::factory()->create(['is_active' => true]);
    $user = User::factory()->create();

    SeasonRanking::create([
        'season_id' => $season->id,
        'user_id' => $user->id,
        'total_points' => 250,
        'rank_position' => 1,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.seasons.export-leaderboard', $season));

    $response->assertOk();
    $response->assertHeader('content-disposition');
});
