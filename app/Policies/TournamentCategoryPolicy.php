<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\TournamentCategory;
use App\Models\User;

class TournamentCategoryPolicy
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

    public function view(User $user, TournamentCategory $category): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_CREATE->value);
    }

    public function update(User $user, TournamentCategory $category): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_UPDATE->value)
            && ($user->id === $category->event->organizer_id || $user->hasRole('admin'));
    }

    public function delete(User $user, TournamentCategory $category): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_DELETE->value)
            && ($user->id === $category->event->organizer_id || $user->hasRole('admin'));
    }
}
