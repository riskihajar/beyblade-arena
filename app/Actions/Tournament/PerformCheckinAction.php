<?php

namespace App\Actions\Tournament;

use App\Enums\DeckLockPolicyEnum;
use App\Enums\RegistrationStatusEnum;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PerformCheckinAction
{
    /**
     * Perform venue check-in for a blader.
     *
     * @throws ValidationException
     */
    public function execute(Registration $registration, ?User $operator = null): Registration
    {
        if ($registration->status !== RegistrationStatusEnum::CONFIRMED) {
            throw ValidationException::withMessages([
                'registration' => 'Hanya peserta dengan status Terkonfirmasi (Confirmed) yang dapat melakukan check-in.',
            ]);
        }

        $category = $registration->category;

        // Auto-lock deck if policy requires locking at check-in
        $shouldLockDeck = ($category->deck_lock_policy === DeckLockPolicyEnum::UNTIL_CHECKIN);

        $registration->update([
            'status' => RegistrationStatusEnum::CHECKED_IN,
            'is_deck_locked' => $shouldLockDeck ? true : $registration->is_deck_locked,
        ]);

        return $registration;
    }

    /**
     * Mark a blader as No-Show.
     */
    public function markNoShow(Registration $registration, ProcessRegistrationQuotaAction $quotaAction): Registration
    {
        $registration->update([
            'status' => RegistrationStatusEnum::NO_SHOW,
        ]);

        // Auto-promote waitlist to fill the vacant spot
        $quotaAction->execute($registration->category);

        return $registration;
    }
}
