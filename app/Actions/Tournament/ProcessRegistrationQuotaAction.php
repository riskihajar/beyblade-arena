<?php

namespace App\Actions\Tournament;

use App\Enums\RegistrationStatusEnum;
use App\Models\Registration;
use App\Models\TournamentCategory;

class ProcessRegistrationQuotaAction
{
    /**
     * Check category quota and promote next waitlisted blader if slot is available.
     *
     * @return Registration|null The promoted registration, or null if no promotion occurred.
     */
    public function execute(TournamentCategory $category): ?Registration
    {
        $confirmedCount = Registration::where('category_id', $category->id)
            ->whereIn('status', [
                RegistrationStatusEnum::CONFIRMED->value,
                RegistrationStatusEnum::CHECKED_IN->value,
            ])
            ->count();

        if ($confirmedCount >= $category->max_participants) {
            return null; // No slots available
        }

        // Find earliest waitlisted blader
        $nextWaitlisted = Registration::where('category_id', $category->id)
            ->where('status', RegistrationStatusEnum::WAITLISTED->value)
            ->orderBy('created_at')
            ->first();

        if (! $nextWaitlisted) {
            return null; // No one in waitlist
        }

        $nextSeed = $confirmedCount + 1;

        $nextWaitlisted->update([
            'status' => RegistrationStatusEnum::CONFIRMED,
            'seed_number' => $nextSeed,
        ]);

        return $nextWaitlisted;
    }
}
