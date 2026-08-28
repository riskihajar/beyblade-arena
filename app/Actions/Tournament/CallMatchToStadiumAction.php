<?php

namespace App\Actions\Tournament;

use App\Enums\MatchStatusEnum;
use App\Enums\StadiumStatusEnum;
use App\Events\Tournament\MatchCalledEvent;
use App\Models\Stadium;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Services\MatchSchedulingConflictService;
use Illuminate\Validation\ValidationException;

class CallMatchToStadiumAction
{
    public function __construct(
        protected MatchSchedulingConflictService $conflictService
    ) {}

    /**
     * Call a scheduled match to an available stadium arena.
     *
     * @throws ValidationException
     */
    public function execute(
        TournamentMatch $match,
        Stadium $stadium,
        ?User $judge = null
    ): TournamentMatch {
        // 1. Verify match is ready to be called
        if (! $match->player1_id || ! $match->player2_id) {
            throw ValidationException::withMessages([
                'match' => 'Pertandingan belum siap dipanggil karena salah satu slot blader belum terisi.',
            ]);
        }

        if ($match->status !== MatchStatusEnum::SCHEDULED) {
            throw ValidationException::withMessages([
                'match' => 'Hanya pertandingan berstatus Terjadwal (Scheduled) yang dapat dipanggil.',
            ]);
        }

        // 2. Check blader scheduling conflicts
        $conflict = $this->conflictService->checkConflict($match);
        if ($conflict) {
            throw ValidationException::withMessages([
                'match' => "Bentrok jadwal: Salah satu blader saat ini sedang bertanding aktif di {$conflict['stadium_name']} ({$conflict['category_name']}).",
            ]);
        }

        // 3. Update Match
        $match->update([
            'stadium_id' => $stadium->id,
            'judge_id' => $judge?->id ?? $stadium->assigned_judge_id,
            'status' => MatchStatusEnum::CALLED,
            'called_at' => now(),
        ]);

        // 4. Update Stadium
        $stadium->update([
            'status' => StadiumStatusEnum::IN_USE,
        ]);

        MatchCalledEvent::dispatch($match);

        return $match;
    }
}
