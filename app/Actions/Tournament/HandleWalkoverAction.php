<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Models\Stadium;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class HandleWalkoverAction
{
    public function __construct(
        protected ProgressBracketWinnerAction $progressWinnerAction
    ) {}

    /**
     * Handle Walkover (WO) for a match.
     *
     * @throws ValidationException
     */
    public function execute(
        TournamentMatch $match,
        string $presentPlayerId,
        string $reason,
        User $judge
    ): TournamentMatch {
        if ($match->status === MatchStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'match' => 'Pertandingan ini sudah selesai.',
            ]);
        }

        if ($presentPlayerId !== $match->player1_id && $presentPlayerId !== $match->player2_id) {
            throw ValidationException::withMessages([
                'present_player_id' => 'Peserta yang hadir harus merupakan salah satu pemain dalam pertandingan.',
            ]);
        }

        $targetPoints = $match->ruleset_snapshot['points_to_win'] ?? 4;
        $isPlayer1Winner = ($presentPlayerId === $match->player1_id);

        $match->update([
            'status' => MatchStatusEnum::WALKOVER,
            'winner_id' => $presentPlayerId,
            'player1_score' => $isPlayer1Winner ? $targetPoints : 0,
            'player2_score' => $isPlayer1Winner ? 0 : $targetPoints,
            'completed_at' => now(),
            'dispute_reason' => "Walkover (WO) diberikan oleh juri {$judge->name}. Alasan: {$reason}",
        ]);

        if ($match->stadium_id) {
            Stadium::where('id', $match->stadium_id)->update(['status' => StadiumStatusEnum::AVAILABLE]);
        }

        $this->progressWinnerAction->execute($match);

        return $match;
    }
}
