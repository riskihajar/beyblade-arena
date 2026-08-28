<?php

use App\Actions\Tournament\RecordMatchBattleAction;
use App\Enums\EventStatusEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Season;
use App\Models\SeasonPointsAudit;
use App\Models\SeasonRanking;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\SeasonRankingCalculatorService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Artisan;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('season ranking calculation engine computes participation, wins, and placements correctly', function () {
    $season = Season::factory()->create([
        'name' => 'Season 1 Mahakam',
        'is_active' => true,
        'formula_config' => [
            'participation_points' => 10,
            'match_win_points' => 5,
            'placement_points' => [
                'first_place' => 100,
                'second_place' => 70,
                'third_place' => 50,
            ],
        ],
    ]);

    $event = Event::factory()->create([
        'season_id' => $season->id,
        'is_ranking_eligible' => true,
        'tier_multiplier' => 1.5, // 1.5x Multiplier
        'status' => EventStatusEnum::COMPLETED,
    ]);

    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
    ]);

    $u1 = User::factory()->create(['name' => 'Champion Blader']);
    $u2 = User::factory()->create(['name' => 'Runner Up Blader']);

    $r1 = Registration::factory()->create([
        'event_id' => $event->id,
        'category_id' => $category->id,
        'user_id' => $u1->id,
        'status' => RegistrationStatusEnum::CHECKED_IN,
    ]);

    $r2 = Registration::factory()->create([
        'event_id' => $event->id,
        'category_id' => $category->id,
        'user_id' => $u2->id,
        'status' => RegistrationStatusEnum::CHECKED_IN,
    ]);

    // Final Match: Champion beats Runner-up
    TournamentMatch::create([
        'category_id' => $category->id,
        'round_number' => 1,
        'match_order' => 1,
        'bracket_type' => 'finals',
        'player1_id' => $r1->id,
        'player2_id' => $r2->id,
        'winner_id' => $r1->id,
        'player1_score' => 4,
        'player2_score' => 2,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    $service = app(SeasonRankingCalculatorService::class);
    $rankings = $service->recalculate($season);

    expect($rankings)->toHaveCount(2);

    $rank1 = $rankings->firstWhere('user_id', $u1->id);
    $rank2 = $rankings->firstWhere('user_id', $u2->id);

    // Expected Points for Champion (u1):
    // - Participation: 10 * 1.5 = 15
    // - Match Win: 5 * 1.5 = 8 (round(7.5) = 8)
    // - Champion Placement: 100 * 1.5 = 150
    // Total = 15 + 8 + 150 = 173
    expect($rank1->rank_position)->toBe(1);
    expect($rank1->total_points)->toBe(173);
    expect($rank1->tournaments_won)->toBe(1);
    expect($rank1->matches_won)->toBe(1);

    // Expected Points for Runner-Up (u2):
    // - Participation: 10 * 1.5 = 15
    // - Runner-up Placement: 70 * 1.5 = 105
    // Total = 15 + 105 = 120
    expect($rank2->rank_position)->toBe(2);
    expect($rank2->total_points)->toBe(120);

    // Verify audit logs
    $audits = SeasonPointsAudit::where('season_id', $season->id)->get();
    expect($audits)->not->toBeEmpty();
});

test('recalculate season rankings artisan command runs successfully', function () {
    $season = Season::factory()->create(['name' => 'Season 2026', 'is_active' => true]);

    $exitCode = Artisan::call('tournament:recalculate-rankings', ['season' => $season->id]);

    expect($exitCode)->toBe(0);
});
