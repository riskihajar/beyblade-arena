<?php

use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Event;
use App\Models\MatchBattle;
use App\Models\Registration;
use App\Models\Season;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('public homepage displays upcoming events and active season rankings', function () {
    $season = Season::factory()->create(['name' => 'Season 1: Mahakam League', 'is_active' => true]);
    $event = Event::factory()->create([
        'name' => 'Samarinda Xtreme Cup',
        'season_id' => $season->id,
        'status' => EventStatusEnum::PUBLISHED,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('upcomingEvents', 1)
        ->where('upcomingEvents.0.name', 'Samarinda Xtreme Cup')
        ->has('activeSeason')
    );
});

test('public event detail page displays event info and category quotas without private data', function () {
    $event = Event::factory()->create([
        'name' => 'Open Gathering Samarinda',
        'status' => EventStatusEnum::REGISTRATION_OPEN,
    ]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'name' => 'Open Divisi',
        'max_participants' => 32,
    ]);

    $response = $this->get(route('public.events.show', $event));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/events/show')
        ->where('event.name', 'Open Gathering Samarinda')
        ->has('event.categories', 1)
        ->where('event.categories.0.name', 'Open Divisi')
    );
});

test('public live hub displays stadiums and matches with zero PII exposure', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);
    $stadium = Stadium::factory()->create(['event_id' => $event->id, 'name' => 'Arena Mahakam']);

    $parent = User::factory()->create(['email' => 'wali.rahasia@example.com']);
    $blader = User::factory()->create(['name' => 'Junior Blader Kid']);

    $reg = Registration::factory()->create([
        'event_id' => $event->id,
        'category_id' => $category->id,
        'user_id' => $blader->id,
        'status' => RegistrationStatusEnum::CHECKED_IN,
        'guardian_details' => [
            'guardian_name' => 'Orang Tua Super Rahasia',
            'guardian_phone' => '081234567890',
            'guardian_email' => 'wali.rahasia@example.com',
        ],
    ]);

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'stadium_id' => $stadium->id,
        'player1_id' => $reg->id,
        'player2_id' => null,
        'status' => MatchStatusEnum::CALLED,
    ]);

    $response = $this->get(route('public.events.live', $event));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/events/live-hub')
        ->where('event.id', $event->id)
        ->has('stadiums', 1)
    );

    // Assert that guardian details and private PII are NEVER present in response content
    $content = $response->getContent();
    expect($content)->not->toContain('Orang Tua Super Rahasia');
    expect($content)->not->toContain('081234567890');
    expect($content)->not->toContain('wali.rahasia@example.com');
});

test('public podium page summarizes winners and finish stats', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::COMPLETED]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id, 'name' => 'Divisi Utama']);

    $r1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);
    $r2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);

    $finalMatch = TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 3,
        'match_order' => 1,
        'bracket_type' => 'finals',
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'winner_id' => $r1->id,
        'player1_score' => 4,
        'player2_score' => 2,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    MatchBattle::create([
        'match_id' => $finalMatch->id,
        'battle_number' => 1,
        'winner_id' => $r1->id,
        'finish_type' => 'burst_finish',
        'points_awarded' => 2,
        'player1_points_after' => 2,
        'player2_points_after' => 0,
        'is_draw' => false,
    ]);

    $response = $this->get(route('public.events.podium', $event));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('public/events/podium')
        ->where('results.0.category.name', 'Divisi Utama')
        ->where('results.0.first_place.id', $r1->id)
    );
});

test('community page returns ok', function () {
    $response = $this->get(route('community'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->component('public/community'));
});
