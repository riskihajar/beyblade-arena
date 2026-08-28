<?php

namespace App\Actions\Tournament;

use App\Models\Registration;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class OverrideLockedDeckAction
{
    /**
     * Override locked deck parts for a blader with an audited reason.
     *
     * @throws ValidationException
     */
    public function execute(Registration $registration, array $newDeckData, string $reason, User $operator): Registration
    {
        if (empty(trim($reason))) {
            throw ValidationException::withMessages([
                'reason' => 'Alasan tertulis resmi juri/panitia wajib diisi untuk melakukan override part deck yang telah terkunci.',
            ]);
        }

        $oldDeckData = $registration->deck_data;

        $notes = $registration->notes ? $registration->notes."\n" : '';
        $notes .= sprintf(
            '[%s] Deck di-override oleh %s (%s). Alasan: %s',
            now()->format('Y-m-d H:i:s'),
            $operator->name,
            $operator->email,
            $reason
        );

        $registration->update([
            'deck_data' => $newDeckData,
            'notes' => $notes,
        ]);

        return $registration;
    }
}
