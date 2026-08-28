<?php

use App\Enums\EventStatusEnum;
use App\Models\Event;
use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('guests are redirected to login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit dashboard and receive tournament data', function () {
    $user = User::factory()->create();

    $season = Season::factory()->create(['name' => 'Season 2026', 'is_active' => true]);
    $event = Event::factory()->create([
        'season_id' => $season->id,
        'name' => 'Samarinda Beyblade Grand Prix',
        'status' => EventStatusEnum::ONGOING,
    ]);

    SeasonRanking::create([
        'season_id' => $season->id,
        'user_id' => $user->id,
        'total_points' => 150,
        'rank_position' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('stats.active_events')
            ->has('stats.total_events')
            ->has('stats.total_bladers')
            ->has('stats.active_matches')
            ->has('stats.active_stadiums')
            ->has('stats.total_battles')
            ->has('activeEvent')
            ->where('activeEvent.id', $event->id)
            ->has('recentEvents')
            ->has('topRankings', 1)
            ->where('activeSeason.id', $season->id)
        );
});
