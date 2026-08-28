<?php

use App\Actions\Tournament\CallMatchToStadiumAction;
use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('calling match sets match to called and stadium to in_use', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);
    $stadium = Stadium::factory()->create(['event_id' => $event->id, 'status' => StadiumStatusEnum::AVAILABLE]);

    $r1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);
    $r2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'status' => MatchStatusEnum::SCHEDULED,
    ]);

    $callAction = app(CallMatchToStadiumAction::class);
    $callAction->execute($match, $stadium);

    $match->refresh();
    $stadium->refresh();

    expect($match->status)->toBe(MatchStatusEnum::CALLED);
    expect($match->stadium_id)->toBe($stadium->id);
    expect($match->called_at)->not->toBeNull();
    expect($stadium->status)->toBe(StadiumStatusEnum::IN_USE);
});

test('calling match detects conflict when a blader is active in another stadium', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $cat1 = TournamentCategory::factory()->create(['event_id' => $event->id, 'name' => 'Open Divisi']);
    $cat2 = TournamentCategory::factory()->create(['event_id' => $event->id, 'name' => 'Deck 3v3 Divisi']);

    $stadiumA = Stadium::factory()->create(['event_id' => $event->id, 'name' => 'Stadium A', 'status' => StadiumStatusEnum::IN_USE]);
    $stadiumB = Stadium::factory()->create(['event_id' => $event->id, 'name' => 'Stadium B', 'status' => StadiumStatusEnum::AVAILABLE]);

    $userA = User::factory()->create(['name' => 'Valsh']);
    $userB = User::factory()->create(['name' => 'Kuro']);
    $userC = User::factory()->create(['name' => 'Jin']);

    // Valsh is registered in both categories
    $r1Cat1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $cat1->id, 'user_id' => $userA->id]);
    $r2Cat1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $cat1->id, 'user_id' => $userB->id]);

    $r1Cat2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $cat2->id, 'user_id' => $userA->id]);
    $r2Cat2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $cat2->id, 'user_id' => $userC->id]);

    // Active match in Stadium A with Valsh
    TournamentMatch::create([
        'category_id' => $cat1->id,
        'stadium_id' => $stadiumA->id,
        'player1_id' => $r1Cat1->id,
        'player2_id' => $r2Cat1->id,
        'status' => MatchStatusEnum::IN_PROGRESS,
    ]);

    // Second match in Cat 2 also with Valsh
    $match2 = TournamentMatch::create([
        'category_id' => $cat2->id,
        'player1_id' => $r1Cat2->id,
        'player2_id' => $r2Cat2->id,
        'status' => MatchStatusEnum::SCHEDULED,
    ]);

    $callAction = app(CallMatchToStadiumAction::class);

    // Attempting to call Match 2 to Stadium B while Valsh is busy in Stadium A must fail
    expect(fn () => $callAction->execute($match2, $stadiumB))
        ->toThrow(ValidationException::class);
});
