<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\Event;
use App\Models\User;

class EventPolicy
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
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_CREATE->value)
            || $user->hasRole('organizer')
            || $user->hasRole('admin');
    }

    public function view(User $user, Event $event): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_CREATE->value)
            || $user->hasRole('organizer')
            || $user->hasRole('admin')
            || $user->id === $event->organizer_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_CREATE->value);
    }

    public function update(User $user, Event $event): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_UPDATE->value)
            && ($user->id === $event->organizer_id || $user->hasRole('admin'));
    }

    public function delete(User $user, Event $event): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_DELETE->value)
            && ($user->id === $event->organizer_id || $user->hasRole('admin'));
    }
}
