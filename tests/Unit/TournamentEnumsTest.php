<?php

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Enums\EventStatusEnum;
use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Enums\StageFormatEnum;
use App\Enums\TournamentPermissionEnum;
use App\Enums\UserRoleEnum;
use App\Models\TournamentRuleset;

test('event format enum provides valid cases and descriptive labels', function () {
    expect(EventFormatEnum::SINGLE_ELIMINATION->value)->toBe('single_elimination');
    expect(EventFormatEnum::DOUBLE_ELIMINATION->value)->toBe('double_elimination');
    expect(EventFormatEnum::ROUND_ROBIN->value)->toBe('round_robin');
    expect(EventFormatEnum::SWISS->value)->toBe('swiss');
    expect(EventFormatEnum::CUSTOM_GROUP_PLAYOFF->value)->toBe('custom_group_playoff');

    expect(EventFormatEnum::SINGLE_ELIMINATION->label())->toContain('Single Elimination');
});

test('stage format enum provides valid tournament stages', function () {
    expect(StageFormatEnum::ROUND_ROBIN_GROUP->value)->toBe('round_robin_group');
    expect(StageFormatEnum::SINGLE_ELIMINATION_BRACKET->value)->toBe('single_elimination_bracket');
    expect(StageFormatEnum::DOUBLE_ELIMINATION_BRACKET->value)->toBe('double_elimination_bracket');
    expect(StageFormatEnum::SWISS_ROUNDS->value)->toBe('swiss_rounds');
    expect(StageFormatEnum::FREE_FOR_ALL->value)->toBe('free_for_all');
});

test('match finish type enum awards standard Takara Tomy Beyblade X points', function () {
    expect(MatchFinishTypeEnum::SPIN_FINISH->defaultPoints())->toBe(1);
    expect(MatchFinishTypeEnum::OVER_FINISH->defaultPoints())->toBe(2);
    expect(MatchFinishTypeEnum::BURST_FINISH->defaultPoints())->toBe(2);
    expect(MatchFinishTypeEnum::XTREME_FINISH->defaultPoints())->toBe(3);
    expect(MatchFinishTypeEnum::PENALTY_FOUL->defaultPoints())->toBe(1);
});

test('tournament ruleset correctly computes dynamic points for finish types', function () {
    $ruleset = new TournamentRuleset([
        'name' => 'Custom 7-Point Ruleset',
        'points_to_win' => 7,
        'spin_finish_points' => 1,
        'over_finish_points' => 2,
        'burst_finish_points' => 2,
        'xtreme_finish_points' => 4, // Custom high xtreme
        'penalty_points' => 2,
    ]);

    expect($ruleset->getPointsForFinishType(MatchFinishTypeEnum::SPIN_FINISH))->toBe(1);
    expect($ruleset->getPointsForFinishType(MatchFinishTypeEnum::OVER_FINISH))->toBe(2);
    expect($ruleset->getPointsForFinishType(MatchFinishTypeEnum::BURST_FINISH))->toBe(2);
    expect($ruleset->getPointsForFinishType(MatchFinishTypeEnum::XTREME_FINISH))->toBe(4);
    expect($ruleset->getPointsForFinishType(MatchFinishTypeEnum::PENALTY_FOUL))->toBe(2);
});

test('deck lock policy enum contains community-standard policies', function () {
    expect(DeckLockPolicyEnum::UNTIL_CHECKIN->value)->toBe('until_checkin');
    expect(DeckLockPolicyEnum::UNTIL_TOP_CUT->value)->toBe('until_top_cut');
    expect(DeckLockPolicyEnum::FREE_BETWEEN_MATCHES->value)->toBe('free_between_matches');
});

test('event and registration status enums provide helper check methods', function () {
    expect(EventStatusEnum::REGISTRATION_OPEN->isRegistrationActive())->toBeTrue();
    expect(EventStatusEnum::DRAFT->isRegistrationActive())->toBeFalse();
    expect(EventStatusEnum::ONGOING->isLive())->toBeTrue();

    expect(RegistrationStatusEnum::CONFIRMED->isEligibleForBracket())->toBeTrue();
    expect(RegistrationStatusEnum::CHECKED_IN->isEligibleForBracket())->toBeTrue();
    expect(RegistrationStatusEnum::PENDING->isEligibleForBracket())->toBeFalse();
    expect(RegistrationStatusEnum::DISQUALIFIED->isEligibleForBracket())->toBeFalse();

    expect(StadiumStatusEnum::AVAILABLE->isAvailable())->toBeTrue();
    expect(StadiumStatusEnum::IN_USE->isAvailable())->toBeFalse();

    expect(MatchStatusEnum::COMPLETED->isFinal())->toBeTrue();
    expect(MatchStatusEnum::WALKOVER->isFinal())->toBeTrue();
    expect(MatchStatusEnum::IN_PROGRESS->isFinal())->toBeFalse();
});

test('user roles and tournament permissions are fully declared', function () {
    expect(UserRoleEnum::ADMIN->value)->toBe('admin');
    expect(UserRoleEnum::ORGANIZER->value)->toBe('organizer');
    expect(UserRoleEnum::JUDGE->value)->toBe('judge');
    expect(UserRoleEnum::BLADER->value)->toBe('blader');

    $permissions = TournamentPermissionEnum::values();
    expect($permissions)->toContain('tournament.view');
    expect($permissions)->toContain('tournament.create');
    expect($permissions)->toContain('tournament.judge');
    expect($permissions)->toContain('season.manage');
});
