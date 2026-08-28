<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CorrectMatchScoreAction
{
    public function __construct(
        protected ProgressBracketWinnerAction $progressWinnerAction
    ) {}

    /**
     * Correct a match score with downstream progression safety.
     *
     * @throws ValidationException
     */
    public function execute(
        TournamentMatch $match,
        int $player1Score,
        int $player2Score,
        ?string $winnerId,
        string $reason,
        User $operator
    ): TournamentMatch {
        if (empty(trim($reason))) {
            throw ValidationException::withMessages([
                'reason' => 'Alasan koreksi skor resmi wajib diisi.',
            ]);
        }

        // Downstream check: If next match is already in progress or completed, require dispute resolution first
        if ($match->next_match_id) {
            $nextMatch = TournamentMatch::find($match->next_match_id);
            if ($nextMatch && in_array($nextMatch->status, [MatchStatusEnum::IN_PROGRESS, MatchStatusEnum::COMPLETED])) {
                throw ValidationException::withMessages([
                    'match' => 'Pertandingan lanjutan di bagan sudah berjalan atau selesai. Hubungi Head Judge untuk melakukan resolusi dispute.',
                ]);
            }
        }

        $targetPoints = $match->ruleset_snapshot['points_to_win'] ?? 4;
        $isCompleted = ($player1Score >= $targetPoints || $player2Score >= $targetPoints);

        $match->update([
            'player1_score' => $player1Score,
            'player2_score' => $player2Score,
            'winner_id' => $winnerId,
            'status' => $isCompleted ? MatchStatusEnum::COMPLETED : MatchStatusEnum::IN_PROGRESS,
            'dispute_reason' => "[Koreksi oleh {$operator->name}] {$reason}",
        ]);

        if ($isCompleted) {
            $this->progressWinnerAction->execute($match);
        }

        return $match;
    }
}
