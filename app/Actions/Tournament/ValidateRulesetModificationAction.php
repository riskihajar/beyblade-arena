<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Models\TournamentCategory;
use Illuminate\Validation\ValidationException;

class ValidateRulesetModificationAction
{
    /**
     * Ensure tournament category ruleset / format cannot be modified if matches are already live/completed.
     *
     * @throws ValidationException
     */
    public function execute(TournamentCategory $category): void
    {
        $hasActiveOrCompletedMatches = $category->matches()
            ->whereIn('status', [
                MatchStatusEnum::CALLED->value,
                MatchStatusEnum::IN_PROGRESS->value,
                MatchStatusEnum::COMPLETED->value,
                MatchStatusEnum::WALKOVER->value,
            ])
            ->exists();

        if ($hasActiveOrCompletedMatches) {
            throw ValidationException::withMessages([
                'ruleset_id' => 'Aturan penilaian dan format kategori tidak dapat diubah karena pertandingan sudah berjalan atau selesai.',
            ]);
        }
    }
}
