<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\Stadium;
use App\Models\User;

class StadiumPolicy
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

    public function view(User $user, Stadium $stadium): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::STADIUM_MANAGE->value);
    }

    public function update(User $user, Stadium $stadium): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::STADIUM_MANAGE->value);
    }

    public function delete(User $user, Stadium $stadium): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::STADIUM_MANAGE->value);
    }
}
