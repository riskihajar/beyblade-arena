<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\TournamentRuleset;
use App\Models\User;

class TournamentRulesetPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::RULESET_MANAGE->value)
            || $user->hasRole('admin');
    }

    public function view(User $user, TournamentRuleset $ruleset): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::RULESET_MANAGE->value);
    }

    public function update(User $user, TournamentRuleset $ruleset): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::RULESET_MANAGE->value);
    }

    public function delete(User $user, TournamentRuleset $ruleset): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::RULESET_MANAGE->value);
    }
}
