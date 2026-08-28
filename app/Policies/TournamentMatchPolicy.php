<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\TournamentMatch;
use App\Models\User;

class TournamentMatchPolicy
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
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_VIEW->value);
    }

    public function view(User $user, TournamentMatch $match): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_MANAGE_BRACKETS->value);
    }

    public function update(User $user, TournamentMatch $match): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_MANAGE_BRACKETS->value)
            || ($user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_JUDGE->value) && $user->id === $match->judge_id);
    }

    public function score(User $user, TournamentMatch $match): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_JUDGE->value)
            || $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_MANAGE_BRACKETS->value);
    }

    public function delete(User $user, TournamentMatch $match): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_MANAGE_BRACKETS->value);
    }
}
