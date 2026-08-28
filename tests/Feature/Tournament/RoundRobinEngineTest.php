<?php

use App\Actions\Tournament\CalculateRoundRobinStandingsAction;
use App\Actions\Tournament\GenerateRoundRobinScheduleAction;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('round robin schedule generation creates balanced Berger pairings for 4 participants', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'format' => EventFormatEnum::ROUND_ROBIN,
    ]);

    // 4 players -> 3 rounds, 2 matches per round = 6 total matches
    $registrations = [];
    for ($i = 1; $i <= 4; $i++) {
        $user = User::factory()->create(['name' => "Player $i"]);
        $registrations[] = Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $action = app(GenerateRoundRobinScheduleAction::class);
    $matches = $action->execute($category);

    expect($matches)->toHaveCount(6);

    // Verify 3 distinct rounds with 2 matches each
    $rounds = $matches->groupBy('round_number');
    expect($rounds)->toHaveCount(3);
    foreach ($rounds as $roundNumber => $roundMatches) {
        expect($roundMatches)->toHaveCount(2);

        // Verify each player plays exactly once per round
        $playersInRound = $roundMatches->pluck('player1_id')->merge($roundMatches->pluck('player2_id'));
        expect($playersInRound->unique())->toHaveCount(4);
    }
});

test('round robin handles odd participants with byes (5 participants)', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'format' => EventFormatEnum::ROUND_ROBIN,
    ]);

    // 5 players -> 5 rounds, 2 matches per round = 10 total matches
    for ($i = 1; $i <= 5; $i++) {
        $user = User::factory()->create(['name' => "Player $i"]);
        Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $action = app(GenerateRoundRobinScheduleAction::class);
    $matches = $action->execute($category);

    expect($matches)->toHaveCount(10);

    // Each round has exactly 2 matches (1 player sits out on Bye)
    $rounds = $matches->groupBy('round_number');
    expect($rounds)->toHaveCount(5);
    foreach ($rounds as $roundMatches) {
        expect($roundMatches)->toHaveCount(2);
    }
});

test('round robin standings resolves head-to-head and point differential tie-breakers', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'format' => EventFormatEnum::ROUND_ROBIN,
    ]);

    $u1 = User::factory()->create(['name' => 'Alice']);
    $u2 = User::factory()->create(['name' => 'Bob']);
    $u3 = User::factory()->create(['name' => 'Charlie']);

    $r1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id, 'user_id' => $u1->id, 'status' => RegistrationStatusEnum::CHECKED_IN]);
    $r2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id, 'user_id' => $u2->id, 'status' => RegistrationStatusEnum::CHECKED_IN]);
    $r3 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id, 'user_id' => $u3->id, 'status' => RegistrationStatusEnum::CHECKED_IN]);

    // Match 1: Alice beats Bob (4 - 2)
    TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 1,
        'match_order' => 1,
        'bracket_position' => 1,
        'bracket_type' => 'group',
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'player1_score' => 4,
        'player2_score' => 2,
        'winner_id' => $r1->id,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    // Match 2: Bob beats Charlie (4 - 1)
    TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 2,
        'match_order' => 2,
        'bracket_position' => 1,
        'bracket_type' => 'group',
        'player1_id' => $r2->id,
        'player2_id' => $r3->id,
        'player1_score' => 4,
        'player2_score' => 1,
        'winner_id' => $r2->id,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    // Match 3: Charlie beats Alice (4 - 2)
    TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 3,
        'match_order' => 3,
        'bracket_position' => 1,
        'bracket_type' => 'group',
        'player1_id' => $r3->id,
        'player2_id' => $r1->id,
        'player1_score' => 4,
        'player2_score' => 2,
        'winner_id' => $r3->id,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    // Everyone has 1 Win and 1 Loss (3 Points each)
    // Points differential:
    // - Alice: 4+2=6 BP+, 2+4=6 BP- => diff 0
    // - Bob: 2+4=6 BP+, 4+1=5 BP- => diff +1
    // - Charlie: 1+4=5 BP+, 4+2=6 BP- => diff -1
    //
    // Ranking order based on diff:
    // Rank 1: Bob (diff +1)
    // Rank 2: Alice (diff 0)
    // Rank 3: Charlie (diff -1)

    $standingsAction = app(CalculateRoundRobinStandingsAction::class);
    $standings = $standingsAction->execute($category);

    expect($standings)->toHaveCount(3);
    expect($standings[0]['registration_id'])->toBe($r2->id); // Bob is Rank 1 (+1 diff)
    expect($standings[0]['rank'])->toBe(1);
    expect($standings[0]['bp_diff'])->toBe(1);

    expect($standings[1]['registration_id'])->toBe($r1->id); // Alice is Rank 2 (0 diff)
    expect($standings[1]['rank'])->toBe(2);
    expect($standings[1]['bp_diff'])->toBe(0);

    expect($standings[2]['registration_id'])->toBe($r3->id); // Charlie is Rank 3 (-1 diff)
    expect($standings[2]['rank'])->toBe(3);
    expect($standings[2]['bp_diff'])->toBe(-1);
});
