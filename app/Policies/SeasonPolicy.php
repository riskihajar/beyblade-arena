<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\Season;
use App\Models\User;

class SeasonPolicy
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
        return $user->hasPermissionTo(TournamentPermissionEnum::SEASON_MANAGE->value)
            || $user->hasRole('admin');
    }

    public function view(User $user, Season $season): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::SEASON_MANAGE->value);
    }

    public function update(User $user, Season $season): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::SEASON_MANAGE->value);
    }

    public function delete(User $user, Season $season): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::SEASON_MANAGE->value);
    }
}
