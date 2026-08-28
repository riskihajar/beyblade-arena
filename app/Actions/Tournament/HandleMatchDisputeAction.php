<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class HandleMatchDisputeAction
{
    /**
     * Flag a match as disputed for Head Judge review.
     *
     * @throws ValidationException
     */
    public function execute(
        TournamentMatch $match,
        string $reason,
        User $reporter
    ): TournamentMatch {
        if (empty(trim($reason))) {
            throw ValidationException::withMessages([
                'reason' => 'Alasan sengketa / dispute pertandingan wajib diisi.',
            ]);
        }

        $match->update([
            'status' => MatchStatusEnum::DISPUTED,
            'is_disputed' => true,
            'dispute_reason' => "[{$reporter->name}] {$reason}",
        ]);

        return $match;
    }
}
