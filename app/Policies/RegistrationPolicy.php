<?php

namespace App\Policies;

use App\Enums\TournamentPermissionEnum;
use App\Models\Registration;
use App\Models\User;

class RegistrationPolicy
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

    public function view(User $user, Registration $registration): bool
    {
        // User can view their own registration or organizer/admin/judge can view
        return $user->id === $registration->user_id
            || $user->id === $registration->event->organizer_id
            || $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_CHECKIN->value)
            || $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_JUDGE->value);
    }

    public function create(User $user): bool
    {
        return true; // Any authenticated user can register
    }

    public function update(User $user, Registration $registration): bool
    {
        return $user->id === $registration->user_id
            || $user->id === $registration->event->organizer_id
            || $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_UPDATE->value);
    }

    public function delete(User $user, Registration $registration): bool
    {
        return $user->id === $registration->user_id
            || $user->id === $registration->event->organizer_id
            || $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_DELETE->value);
    }

    public function checkin(User $user, Registration $registration): bool
    {
        return $user->hasPermissionTo(TournamentPermissionEnum::TOURNAMENT_CHECKIN->value)
            || $user->id === $registration->event->organizer_id;
    }
}
