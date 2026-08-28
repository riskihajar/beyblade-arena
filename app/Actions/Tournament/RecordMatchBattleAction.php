<?php

namespace App\Actions\Tournament;

use App\Enums\MatchFinishTypeEnum;
use App\Enums\MatchStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Models\MatchBattle;
use App\Models\Stadium;
use App\Models\TournamentMatch;
use Illuminate\Validation\ValidationException;

class RecordMatchBattleAction
{
    public function __construct(
        protected ProgressBracketWinnerAction $progressWinnerAction
    ) {}

    /**
     * Record a battle round for a tournament match.
     *
     * @throws ValidationException
     */
    public function execute(
        TournamentMatch $match,
        array $data
    ): MatchBattle {
        // 1. Idempotency Check
        $clientId = $data['client_request_id'] ?? null;
        if ($clientId) {
            $existing = MatchBattle::where('match_id', $match->id)
                ->where('client_request_id', $clientId)
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        if ($match->status === MatchStatusEnum::COMPLETED) {
            throw ValidationException::withMessages([
                'match' => 'Pertandingan ini sudah selesai.',
            ]);
        }

        $isDraw = ! empty($data['is_draw']);
        $finishType = $isDraw ? MatchFinishTypeEnum::SPIN_FINISH : MatchFinishTypeEnum::from($data['finish_type']);
        $winnerId = $isDraw ? null : ($data['winner_id'] ?? null);

        if (! $isDraw && ! $winnerId) {
            throw ValidationException::withMessages([
                'winner_id' => 'Pemenang ronde battle wajib dipilih jika bukan hasil Draw.',
            ]);
        }

        // 2. Resolve Finish Points
        $points = 0;
        if (! $isDraw) {
            $ruleset = $match->ruleset_snapshot ?? [];
            $points = match ($finishType) {
                MatchFinishTypeEnum::SPIN_FINISH => (int) ($ruleset['spin_finish_points'] ?? 1),
                MatchFinishTypeEnum::OVER_FINISH => (int) ($ruleset['over_finish_points'] ?? 2),
                MatchFinishTypeEnum::BURST_FINISH => (int) ($ruleset['burst_finish_points'] ?? 2),
                MatchFinishTypeEnum::XTREME_FINISH => (int) ($ruleset['xtreme_finish_points'] ?? 3),
                MatchFinishTypeEnum::PENALTY_FOUL => (int) ($ruleset['penalty_points'] ?? 1),
            };
        }

        // 3. Compute New Scores
        $p1Score = (int) $match->player1_score;
        $p2Score = (int) $match->player2_score;

        if (! $isDraw) {
            if ($winnerId === $match->player1_id) {
                $p1Score += $points;
            } elseif ($winnerId === $match->player2_id) {
                $p2Score += $points;
            }
        }

        $nextBattleNumber = (MatchBattle::where('match_id', $match->id)->max('battle_number') ?? 0) + 1;

        // 4. Create Battle Record
        $battle = MatchBattle::create([
            'match_id' => $match->id,
            'battle_number' => $nextBattleNumber,
            'winner_id' => $winnerId,
            'finish_type' => $finishType,
            'points_awarded' => $points,
            'player1_points_after' => $p1Score,
            'player2_points_after' => $p2Score,
            'is_draw' => $isDraw,
            'notes' => $data['notes'] ?? null,
            'client_request_id' => $clientId,
        ]);

        // 5. Update Match Status & Check Target Points
        $targetPoints = (int) ($match->ruleset_snapshot['points_to_win'] ?? $match->category?->target_points ?? 4);
        $isMatchWon = ($p1Score >= $targetPoints || $p2Score >= $targetPoints);

        $matchUpdates = [
            'player1_score' => $p1Score,
            'player2_score' => $p2Score,
        ];

        if ($match->status === MatchStatusEnum::CALLED || $match->status === MatchStatusEnum::SCHEDULED) {
            $matchUpdates['status'] = MatchStatusEnum::IN_PROGRESS;
            $matchUpdates['started_at'] = now();
        }

        if ($isMatchWon) {
            $finalWinnerId = ($p1Score >= $targetPoints) ? $match->player1_id : $match->player2_id;
            $matchUpdates['status'] = MatchStatusEnum::COMPLETED;
            $matchUpdates['completed_at'] = now();
            $matchUpdates['winner_id'] = $finalWinnerId;
        }

        $match->update($matchUpdates);

        // 6. Free Stadium & Progress Bracket if Match Won
        if ($isMatchWon) {
            if ($match->stadium_id) {
                Stadium::where('id', $match->stadium_id)->update(['status' => StadiumStatusEnum::AVAILABLE]);
            }

            $this->progressWinnerAction->execute($match);
        }

        return $battle;
    }
}
