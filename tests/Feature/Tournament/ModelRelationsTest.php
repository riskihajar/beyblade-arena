<?php

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Models\Event;
use App\Models\MatchBattle;
use App\Models\Registration;
use App\Models\Season;
use App\Models\SeasonPointsAudit;
use App\Models\SeasonRanking;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\TournamentRuleset;
use App\Models\User;

test('all tournament models generate valid 26-character ULID strings', function () {
    $ruleset = TournamentRuleset::factory()->create();
    $season = Season::factory()->create();
    $event = Event::factory()->create(['season_id' => $season->id]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'ruleset_id' => $ruleset->id,
    ]);
    $user = User::factory()->create();
    $registration = Registration::factory()->create([
        'event_id' => $event->id,
        'category_id' => $category->id,
        'user_id' => $user->id,
    ]);
    $stadium = Stadium::factory()->create(['event_id' => $event->id]);
    $match = TournamentMatch::factory()->create([
        'category_id' => $category->id,
        'stadium_id' => $stadium->id,
        'player1_id' => $registration->id,
    ]);
    $battle = MatchBattle::factory()->create([
        'match_id' => $match->id,
        'winner_id' => $registration->id,
    ]);
    $ranking = SeasonRanking::factory()->create([
        'season_id' => $season->id,
        'user_id' => $user->id,
    ]);

    expect(strlen($ruleset->id))->toBe(26);
    expect(strlen($season->id))->toBe(26);
    expect(strlen($event->id))->toBe(26);
    expect(strlen($category->id))->toBe(26);
    expect(strlen($registration->id))->toBe(26);
    expect(strlen($stadium->id))->toBe(26);
    expect(strlen($match->id))->toBe(26);
    expect(strlen($battle->id))->toBe(26);
    expect(strlen($ranking->id))->toBe(26);
});

test('season has many events and active scope works', function () {
    $activeSeason = Season::factory()->create(['is_active' => true]);
    $inactiveSeason = Season::factory()->create(['is_active' => false]);

    Event::factory()->count(2)->create(['season_id' => $activeSeason->id]);

    expect($activeSeason->events)->toHaveCount(2);
    expect(Season::active()->pluck('id'))->toContain($activeSeason->id);
    expect(Season::active()->pluck('id'))->not->toContain($inactiveSeason->id);
});

test('event relationships with organizer, categories, stadiums, and registrations work', function () {
    $organizer = User::factory()->create();
    $season = Season::factory()->create();
    $event = Event::factory()->create([
        'organizer_id' => $organizer->id,
        'season_id' => $season->id,
    ]);

    $ruleset = TournamentRuleset::factory()->create();
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'ruleset_id' => $ruleset->id,
    ]);
    $stadium = Stadium::factory()->create(['event_id' => $event->id]);
    $registration = Registration::factory()->create([
        'event_id' => $event->id,
        'category_id' => $category->id,
    ]);

    expect($event->organizer->id)->toBe($organizer->id);
    expect($event->season->id)->toBe($season->id);
    expect($event->categories)->toHaveCount(1);
    expect($event->stadiums)->toHaveCount(1);
    expect($event->registrations)->toHaveCount(1);
});

test('tournament category relationships and match scheduling work', function () {
    $category = TournamentCategory::factory()->create();
    $p1 = Registration::factory()->create(['category_id' => $category->id, 'event_id' => $category->event_id]);
    $p2 = Registration::factory()->create(['category_id' => $category->id, 'event_id' => $category->event_id]);

    $match = TournamentMatch::factory()->create([
        'category_id' => $category->id,
        'player1_id' => $p1->id,
        'player2_id' => $p2->id,
        'winner_id' => $p1->id,
        'status' => MatchStatusEnum::COMPLETED,
    ]);

    $battle = MatchBattle::factory()->create([
        'match_id' => $match->id,
        'winner_id' => $p1->id,
        'finish_type' => MatchFinishTypeEnum::XTREME_FINISH,
        'points_awarded' => 3,
    ]);

    expect($category->matches)->toHaveCount(1);
    expect($match->player1->id)->toBe($p1->id);
    expect($match->player2->id)->toBe($p2->id);
    expect($match->winner->id)->toBe($p1->id);
    expect($match->battles)->toHaveCount(1);
    expect($match->battles->first()->points_awarded)->toBe(3);
});

test('user model relations with registrations, events, rankings, and audits work', function () {
    $user = User::factory()->create();
    $season = Season::factory()->create();
    $event = Event::factory()->create(['organizer_id' => $user->id, 'season_id' => $season->id]);
    $category = TournamentCategory::factory()->create(['event_id' => $event->id]);
    $registration = Registration::factory()->create([
        'user_id' => $user->id,
        'event_id' => $event->id,
        'category_id' => $category->id,
    ]);
    $ranking = SeasonRanking::factory()->create([
        'user_id' => $user->id,
        'season_id' => $season->id,
        'total_points' => 150,
    ]);
    $audit = SeasonPointsAudit::create([
        'user_id' => $user->id,
        'season_id' => $season->id,
        'event_id' => $event->id,
        'points_awarded' => 100,
        'calculation_breakdown' => ['placement' => 100],
        'reason' => '1st Place Champion',
    ]);

    expect($user->organizedEvents)->toHaveCount(1);
    expect($user->registrations)->toHaveCount(1);
    expect($user->seasonRankings)->toHaveCount(1);
    expect($user->pointsAudits)->toHaveCount(1);
});
