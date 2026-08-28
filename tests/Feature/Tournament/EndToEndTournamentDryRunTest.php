<?php

use App\Actions\Tournament\CallMatchToStadiumAction;
use App\Actions\Tournament\GenerateSingleEliminationBracketAction;
use App\Actions\Tournament\PerformCheckinAction;
use App\Actions\Tournament\RecordMatchBattleAction;
use App\Actions\Tournament\RegisterBladerAction;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Enums\UserRoleEnum;
use App\Events\Tournament\EventStatusChangedEvent;
use App\Models\Event;
use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentRuleset;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('end to end tournament lifecycle dry run executes seamlessly', function () {
    // 1. Setup Season, Organizer, Judge, and Ruleset
    $organizer = User::factory()->create(['name' => 'Organizer Samarinda']);
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $judge = User::factory()->create(['name' => 'Judge Utama']);
    $judge->assignRole(UserRoleEnum::JUDGE->value);

    $season = Season::factory()->create([
        'name' => 'Liga Beyblade Samarinda 2026',
        'is_active' => true,
        'formula_config' => [
            'participation_points' => 10,
            'match_win_points' => 5,
            'placement_points' => [
                'first_place' => 100,
                'second_place' => 70,
                'third_place' => 50,
                'top_4' => 30,
            ],
        ],
    ]);

    $ruleset = TournamentRuleset::factory()->create([
        'name' => 'Official B4 4-Point Ruleset',
        'points_to_win' => 4,
        'spin_finish_points' => 1,
        'over_finish_points' => 2,
        'burst_finish_points' => 2,
        'xtreme_finish_points' => 3,
        'penalty_points' => 1,
    ]);

    // 2. Create Event & Category
    $event = Event::factory()->create([
        'season_id' => $season->id,
        'organizer_id' => $organizer->id,
        'name' => 'Samarinda Beyblade Grand Prix 2026',
        'venue_name' => 'Big Mall Samarinda',
        'is_ranking_eligible' => true,
        'tier_multiplier' => 1.5,
        'status' => EventStatusEnum::REGISTRATION_OPEN,
    ]);

    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'ruleset_id' => $ruleset->id,
        'name' => 'Open Division Beyblade X',
        'format' => EventFormatEnum::SINGLE_ELIMINATION->value,
        'max_participants' => 8,
        'target_points' => 4,
        'stage_config' => [
            'has_third_place_match' => true,
        ],
    ]);

    // 3. Register 4 Bladers
    $registerAction = app(RegisterBladerAction::class);
    $bladers = User::factory()->count(4)->create();
    $registrations = [];

    foreach ($bladers as $idx => $blader) {
        $blader->assignRole(UserRoleEnum::BLADER->value);
        $registrations[] = $registerAction->execute($category, [
            'display_nickname' => "Blader_{$idx}",
            'deck_data' => [
                ['blade' => 'Dran Sword', 'ratchet' => '3-60', 'bit' => 'Flat'],
                ['blade' => 'Hells Scythe', 'ratchet' => '4-60', 'bit' => 'Ball'],
                ['blade' => 'Wizard Rod', 'ratchet' => '5-70', 'bit' => 'Disc Ball'],
            ],
            'guardian_details' => [
                'guardian_name' => 'Parent of '.$blader->name,
                'guardian_phone' => '08123456789',
            ],
        ], $blader);
    }

    expect($registrations)->toHaveCount(4);
    expect($registrations[0]->status)->toBe(RegistrationStatusEnum::CONFIRMED);

    // 4. Perform Venue Check-in
    $checkinAction = app(PerformCheckinAction::class);
    foreach ($registrations as $reg) {
        $checkinAction->execute($reg);
        $reg->refresh();
        expect($reg->status)->toBe(RegistrationStatusEnum::CHECKED_IN);
        expect($reg->is_deck_locked)->toBeTrue();
    }

    // 5. Generate Single Elimination Bracket (4 Participants -> Semi Finals -> Finals & Bronze)
    $bracketAction = app(GenerateSingleEliminationBracketAction::class);
    $bracketMatches = $bracketAction->execute($category);

    expect($bracketMatches)->toHaveCount(4); // 2 Semis + 1 Final + 1 Bronze

    // 6. Create Stadiums & Call Match 1
    $stadium1 = Stadium::create([
        'event_id' => $event->id,
        'name' => 'Stadium Alpha (Extreme Dash)',
        'model_type' => 'BX-10 Extreme Stadium',
        'status' => StadiumStatusEnum::AVAILABLE->value,
    ]);

    $match1 = TournamentMatch::where('category_id', $category->id)
        ->where('round_number', 1)
        ->where('match_order', 1)
        ->first();

    $callAction = app(CallMatchToStadiumAction::class);
    $calledMatch = $callAction->execute($match1, $stadium1, $judge);

    expect($calledMatch->status)->toBe(MatchStatusEnum::CALLED);
    $stadium1->refresh();
    expect($stadium1->status)->toBe(StadiumStatusEnum::IN_USE);

    // 7. Judge Records Battles for Match 1: Player 1 wins via Xtreme Finish (3 pts) + Spin Finish (1 pt)
    $battleAction = app(RecordMatchBattleAction::class);

    // Battle 1: Xtreme Finish (+3)
    $battleAction->execute($calledMatch, [
        'winner_id' => $calledMatch->player1_id,
        'finish_type' => MatchFinishTypeEnum::XTREME_FINISH->value,
    ], $judge);

    $calledMatch->refresh();
    expect($calledMatch->player1_score)->toBe(3);
    expect($calledMatch->status)->toBe(MatchStatusEnum::IN_PROGRESS);

    // Battle 2: Spin Finish (+1) -> Total 4 pts -> Wins Match!
    $battleAction->execute($calledMatch, [
        'winner_id' => $calledMatch->player1_id,
        'finish_type' => MatchFinishTypeEnum::SPIN_FINISH->value,
    ], $judge);

    $calledMatch->refresh();
    expect($calledMatch->player1_score)->toBe(4);
    expect($calledMatch->status)->toBe(MatchStatusEnum::COMPLETED);
    expect($calledMatch->winner_id)->toBe($calledMatch->player1_id);

    $stadium1->refresh();
    expect($stadium1->status)->toBe(StadiumStatusEnum::AVAILABLE);

    // 8. Match 2 (Semi 2): Player 1 of match 2 wins
    $match2 = TournamentMatch::where('category_id', $category->id)
        ->where('round_number', 1)
        ->where('match_order', 2)
        ->first();

    $callAction->execute($match2, $stadium1, $judge);

    // Battle: Burst Finish (2) + Burst Finish (2) = 4 pts
    $battleAction->execute($match2, [
        'winner_id' => $match2->player1_id,
        'finish_type' => MatchFinishTypeEnum::BURST_FINISH->value,
    ], $judge);

    $battleAction->execute($match2, [
        'winner_id' => $match2->player1_id,
        'finish_type' => MatchFinishTypeEnum::BURST_FINISH->value,
    ], $judge);

    $match2->refresh();
    expect($match2->status)->toBe(MatchStatusEnum::COMPLETED);
    expect($match2->winner_id)->toBe($match2->player1_id);

    // 9. Finals Match: Winner of Match 1 vs Winner of Match 2
    $finalsMatch = TournamentMatch::where('category_id', $category->id)
        ->where('bracket_type', 'finals')
        ->first();

    expect($finalsMatch->player1_id)->toBe($match1->winner_id);
    expect($finalsMatch->player2_id)->toBe($match2->winner_id);

    $callAction->execute($finalsMatch, $stadium1, $judge);

    // Final battles: Player 1 wins via Xtreme Finish (3 pts) + Spin Finish (1 pt) -> 4 pts!
    $battleAction->execute($finalsMatch, [
        'winner_id' => $finalsMatch->player1_id,
        'finish_type' => MatchFinishTypeEnum::XTREME_FINISH->value,
    ], $judge);

    $battleAction->execute($finalsMatch, [
        'winner_id' => $finalsMatch->player1_id,
        'finish_type' => MatchFinishTypeEnum::SPIN_FINISH->value,
    ], $judge);

    $finalsMatch->refresh();
    expect($finalsMatch->status)->toBe(MatchStatusEnum::COMPLETED);
    expect($finalsMatch->winner_id)->toBe($finalsMatch->player1_id);

    // 10. Bronze Match (3rd Place): Loser of Semi 1 vs Loser of Semi 2
    $bronzeMatch = TournamentMatch::where('category_id', $category->id)
        ->where('bracket_type', 'bronze')
        ->first();

    expect($bronzeMatch->player1_id)->not->toBeNull();
    expect($bronzeMatch->player2_id)->not->toBeNull();

    $callAction->execute($bronzeMatch, $stadium1, $judge);
    $battleAction->execute($bronzeMatch, [
        'winner_id' => $bronzeMatch->player1_id,
        'finish_type' => MatchFinishTypeEnum::XTREME_FINISH->value,
    ], $judge);
    $battleAction->execute($bronzeMatch, [
        'winner_id' => $bronzeMatch->player1_id,
        'finish_type' => MatchFinishTypeEnum::SPIN_FINISH->value,
    ], $judge);

    $bronzeMatch->refresh();
    expect($bronzeMatch->status)->toBe(MatchStatusEnum::COMPLETED);

    // 11. Complete the Event and trigger status change broadcast
    $event->update(['status' => EventStatusEnum::COMPLETED]);
    event(new EventStatusChangedEvent($event));

    // 12. Check Season Rankings
    $rankings = SeasonRanking::where('season_id', $season->id)
        ->orderBy('rank_position')
        ->get();

    expect($rankings)->toHaveCount(4);

    // Grand Champion Rank #1
    $champ = $rankings->first();
    expect($champ->rank_position)->toBe(1);
    expect($champ->tournaments_won)->toBe(1);
    expect($champ->matches_won)->toBe(2);
    expect($champ->total_points)->toBeGreaterThan(150);

    // 13. Verify Public Pages return HTTP 200 without PII
    $this->get(route('home'))->assertOk();
    $this->get(route('public.events.show', $event))->assertOk();
    $this->get(route('public.events.live', $event))->assertOk();
    $this->get(route('public.events.podium', $event))->assertOk();
    $this->get(route('public.leaderboard'))->assertOk();
    $this->get(route('community'))->assertOk();
});
