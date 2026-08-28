<?php

use App\Actions\Tournament\GenerateSingleEliminationBracketAction;
use App\Actions\Tournament\ProgressBracketWinnerAction;
use App\Actions\Tournament\RegenerateBracketAction;
use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('single elimination generates complete balanced bracket for 8 participants', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'max_participants' => 16,
    ]);

    // Create 8 checked-in registrations with seed 1 to 8
    for ($i = 1; $i <= 8; $i++) {
        $user = User::factory()->create(['name' => "Blader Seed $i"]);
        Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'seed_number' => $i,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $action = app(GenerateSingleEliminationBracketAction::class);
    $matches = $action->execute($category);

    // Total matches for 8 players = 4 (R1) + 2 (Semis) + 1 (Final) = 7
    expect($matches)->toHaveCount(7);

    // Check Round 1 matches count
    $r1Matches = $matches->where('round_number', 1);
    expect($r1Matches)->toHaveCount(4);

    // Check Semifinal matches count
    $r2Matches = $matches->where('round_number', 2);
    expect($r2Matches)->toHaveCount(2);

    // Check Final match
    $finalMatch = $matches->where('round_number', 3)->first();
    expect($finalMatch)->not->toBeNull();
    expect($finalMatch->round_number)->toBe(3);

    // Check pointers: R1 matches point to R2, R2 matches point to Final
    foreach ($r1Matches as $m) {
        expect($m->next_match_id)->not->toBeNull();
    }
    foreach ($r2Matches as $m) {
        expect($m->next_match_id)->toBe($finalMatch->id);
    }
});

test('single elimination handles byes for non-power-of-two (7 participants)', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);

    for ($i = 1; $i <= 7; $i++) {
        $user = User::factory()->create(['name' => "Blader $i"]);
        Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'seed_number' => $i,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $action = app(GenerateSingleEliminationBracketAction::class);
    $matches = $action->execute($category);

    expect($matches)->toHaveCount(7);

    // Check that the match with Bye is marked completed and winner advanced
    $byeMatch = $matches->where('round_number', 1)->first(fn ($m) => $m->status === MatchStatusEnum::COMPLETED);
    expect($byeMatch)->not->toBeNull();
    expect($byeMatch->winner_id)->not->toBeNull();

    // Check that Round 2 received the bye winner
    $r2Match = TournamentMatch::find($byeMatch->next_match_id);
    expect($r2Match->player1_id === $byeMatch->winner_id || $r2Match->player2_id === $byeMatch->winner_id)->toBeTrue();
});

test('third place playoff match is generated and receives semifinal losers', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'stage_config' => ['has_third_place_match' => true],
    ]);

    for ($i = 1; $i <= 4; $i++) {
        $user = User::factory()->create(['name' => "Blader $i"]);
        Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'seed_number' => $i,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $bracketAction = app(GenerateSingleEliminationBracketAction::class);
    $matches = $bracketAction->execute($category);

    // Total: 2 Semis (R1) + 1 Final (R2) + 1 Third Place (R2) = 4 matches
    expect($matches)->toHaveCount(4);

    $thirdPlaceMatch = $matches->firstWhere('bracket_type', 'bronze');
    expect($thirdPlaceMatch)->not->toBeNull();

    // Simulate Semifinal 1: Player 1 beats Player 2
    $semi1 = $matches->where('round_number', 1)->where('bracket_position', 1)->first();
    $semi1->update([
        'status' => MatchStatusEnum::COMPLETED,
        'winner_id' => $semi1->player1_id,
        'player1_score' => 4,
        'player2_score' => 2,
    ]);

    $progressAction = app(ProgressBracketWinnerAction::class);
    $progressAction->execute($semi1);

    $thirdPlaceMatch->refresh();
    expect($thirdPlaceMatch->player1_id)->toBe($semi1->player2_id); // Loser of semi 1 placed in slot 1
});

test('winner progression automatically fills next match slot', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);

    for ($i = 1; $i <= 4; $i++) {
        $user = User::factory()->create(['name' => "Blader $i"]);
        Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'seed_number' => $i,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $bracketAction = app(GenerateSingleEliminationBracketAction::class);
    $matches = $bracketAction->execute($category);

    $semi1 = $matches->where('round_number', 1)->where('bracket_position', 1)->first();
    $final = $matches->where('round_number', 2)->first();

    $winnerId = $semi1->player1_id;
    $semi1->update([
        'status' => MatchStatusEnum::COMPLETED,
        'winner_id' => $winnerId,
        'player1_score' => 4,
        'player2_score' => 1,
    ]);

    $progressAction = app(ProgressBracketWinnerAction::class);
    $progressAction->execute($semi1);

    $final->refresh();
    expect($final->player1_id)->toBe($winnerId);
});

test('regenerating bracket rejects when active matches exist without force reason', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);

    for ($i = 1; $i <= 4; $i++) {
        $user = User::factory()->create();
        Registration::factory()->create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => RegistrationStatusEnum::CHECKED_IN,
        ]);
    }

    $bracketAction = app(GenerateSingleEliminationBracketAction::class);
    $bracketAction->execute($category);

    // Complete one match
    $firstMatch = TournamentMatch::where('category_id', $category->id)->first();
    $firstMatch->update(['status' => MatchStatusEnum::COMPLETED, 'winner_id' => $firstMatch->player1_id]);

    $regenAction = app(RegenerateBracketAction::class);

    // 1. Fails without force
    expect(fn () => $regenAction->execute($category, force: false))
        ->toThrow(ValidationException::class);

    // 2. Succeeds with force and reason
    $newMatches = $regenAction->execute($category, force: true, reason: 'Perubahan kehadiran resmi meja registrasi');
    expect($newMatches)->not->toBeEmpty();
});
