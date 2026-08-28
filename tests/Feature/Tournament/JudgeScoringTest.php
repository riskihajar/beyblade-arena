<?php

use App\Actions\Tournament\CorrectMatchScoreAction;
use App\Actions\Tournament\HandleMatchDisputeAction;
use App\Actions\Tournament\HandleWalkoverAction;
use App\Actions\Tournament\RecordMatchBattleAction;
use App\Enums\EventStatusEnum;
use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Enums\UserRoleEnum;
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

test('judge can record battle round with spin finish and extreme finish points', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::ONGOING]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'target_points' => 4,
    ]);

    $r1 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);
    $r2 = Registration::factory()->create(['event_id' => $event->id, 'category_id' => $category->id]);

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 1,
        'match_order' => 1,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'status' => MatchStatusEnum::CALLED,
        'ruleset_snapshot' => [
            'points_to_win' => 4,
            'spin_finish_points' => 1,
            'over_finish_points' => 2,
            'burst_finish_points' => 2,
            'xtreme_finish_points' => 3,
            'penalty_points' => 1,
        ],
    ]);

    $recordAction = app(RecordMatchBattleAction::class);

    // Battle 1: Player 1 gets Spin Finish (+1)
    $b1 = $recordAction->execute($match, [
        'winner_id' => $r1->id,
        'finish_type' => 'spin_finish',
        'is_draw' => false,
        'client_request_id' => 'req-001',
    ]);

    $match->refresh();
    expect($match->player1_score)->toBe(1);
    expect($match->player2_score)->toBe(0);
    expect($match->status)->toBe(MatchStatusEnum::IN_PROGRESS);

    // Battle 2: Player 1 gets Xtreme Finish (+3) -> total 4 -> Match Won!
    $b2 = $recordAction->execute($match, [
        'winner_id' => $r1->id,
        'finish_type' => 'xtreme_finish',
        'is_draw' => false,
        'client_request_id' => 'req-002',
    ]);

    $match->refresh();
    expect($match->player1_score)->toBe(4);
    expect($match->status)->toBe(MatchStatusEnum::COMPLETED);
    expect($match->winner_id)->toBe($r1->id);
});

test('idempotency token prevents duplicate point scoring on network retry', function () {
    $category = TournamentCategory::factory()->create(['target_points' => 4]);
    $r1 = Registration::factory()->create(['category_id' => $category->id]);
    $r2 = Registration::factory()->create(['category_id' => $category->id]);

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'status' => MatchStatusEnum::IN_PROGRESS,
        'ruleset_snapshot' => ['points_to_win' => 4, 'spin_finish_points' => 1],
    ]);

    $recordAction = app(RecordMatchBattleAction::class);

    // First request
    $b1 = $recordAction->execute($match, [
        'winner_id' => $r1->id,
        'finish_type' => 'spin_finish',
        'is_draw' => false,
        'client_request_id' => 'network-retry-token-abc',
    ]);

    $match->refresh();
    expect($match->player1_score)->toBe(1);

    // Identical second request (network retry)
    $b2 = $recordAction->execute($match, [
        'winner_id' => $r1->id,
        'finish_type' => 'spin_finish',
        'is_draw' => false,
        'client_request_id' => 'network-retry-token-abc',
    ]);

    $match->refresh();
    expect($match->player1_score)->toBe(1); // Points must remain 1, not 2
    expect($b1->id)->toBe($b2->id);
});

test('draw battle awards 0 points to both players and logs rematch', function () {
    $category = TournamentCategory::factory()->create(['target_points' => 4]);
    $r1 = Registration::factory()->create(['category_id' => $category->id]);
    $r2 = Registration::factory()->create(['category_id' => $category->id]);

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'status' => MatchStatusEnum::IN_PROGRESS,
        'ruleset_snapshot' => ['points_to_win' => 4],
    ]);

    $recordAction = app(RecordMatchBattleAction::class);
    $battle = $recordAction->execute($match, [
        'is_draw' => true,
        'notes' => 'Simultaneous spin out draw',
    ]);

    $match->refresh();
    expect($match->player1_score)->toBe(0);
    expect($match->player2_score)->toBe(0);
    expect($battle->is_draw)->toBeTrue();
    expect($battle->points_awarded)->toBe(0);
});

test('walkover assigns target points to present player and frees stadium', function () {
    $event = Event::factory()->create();
    $category = TournamentCategory::factory()->create(['event_id' => $event->id, 'target_points' => 4]);
    $stadium = Stadium::factory()->create(['event_id' => $event->id, 'status' => StadiumStatusEnum::IN_USE]);

    $r1 = Registration::factory()->create(['category_id' => $category->id]);
    $r2 = Registration::factory()->create(['category_id' => $category->id]);

    $judge = User::factory()->create();

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'stadium_id' => $stadium->id,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'status' => MatchStatusEnum::CALLED,
        'ruleset_snapshot' => ['points_to_win' => 4],
    ]);

    $woAction = app(HandleWalkoverAction::class);
    $woAction->execute($match, $r1->id, 'Player 2 tidak hadir setelah batas 3 menit', $judge);

    $match->refresh();
    $stadium->refresh();

    expect($match->status)->toBe(MatchStatusEnum::WALKOVER);
    expect($match->winner_id)->toBe($r1->id);
    expect($match->player1_score)->toBe(4);
    expect($match->player2_score)->toBe(0);
    expect($stadium->status)->toBe(StadiumStatusEnum::AVAILABLE);
});

test('match dispute and score correction work safely', function () {
    $category = TournamentCategory::factory()->create(['target_points' => 4]);
    $r1 = Registration::factory()->create(['category_id' => $category->id]);
    $r2 = Registration::factory()->create(['category_id' => $category->id]);
    $judge = User::factory()->create();

    $match = TournamentMatch::create([
        'category_id' => $category->id,
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'player1_score' => 2,
        'player2_score' => 2,
        'status' => MatchStatusEnum::IN_PROGRESS,
        'ruleset_snapshot' => ['points_to_win' => 4],
    ]);

    // 1. Flag dispute
    $disputeAction = app(HandleMatchDisputeAction::class);
    $disputeAction->execute($match, 'Klaim kontak launcher ilegal', $judge);

    $match->refresh();
    expect($match->status)->toBe(MatchStatusEnum::DISPUTED);
    expect($match->is_disputed)->toBeTrue();

    // 2. Correct score
    $correctAction = app(CorrectMatchScoreAction::class);
    $correctAction->execute($match, 4, 2, $r1->id, 'Dispute selesai: Penalti untuk Player 2', $judge);

    $match->refresh();
    expect($match->status)->toBe(MatchStatusEnum::COMPLETED);
    expect($match->winner_id)->toBe($r1->id);
    expect($match->player1_score)->toBe(4);
});
