<?php

namespace App\Actions\Tournament;

use App\Enums\EventFormatEnum;
use App\Enums\MatchStatusEnum;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class RegenerateBracketAction
{
    public function __construct(
        protected GenerateSingleEliminationBracketAction $singleElimAction,
        protected GenerateRoundRobinScheduleAction $roundRobinAction
    ) {}

    /**
     * Safely regenerate bracket for a tournament category.
     *
     * @throws ValidationException
     * @return Collection<int, TournamentMatch>
     */
    public function execute(
        TournamentCategory $category,
        bool $force = false,
        ?string $reason = null,
        ?User $operator = null
    ): Collection {
        $hasActiveMatches = TournamentMatch::where('category_id', $category->id)
            ->whereIn('status', [MatchStatusEnum::IN_PROGRESS, MatchStatusEnum::COMPLETED])
            ->exists();

        if ($hasActiveMatches && ! $force) {
            throw ValidationException::withMessages([
                'bracket' => 'Bagan sudah memiliki pertandingan yang sedang berlangsung atau selesai. Regenerasi memerlukan konfirmasi paksa (force) dan alasan resmi tertulis.',
            ]);
        }

        if ($hasActiveMatches && empty(trim($reason ?? ''))) {
            throw ValidationException::withMessages([
                'reason' => 'Alasan wajib diisi saat meregenerasi bagan yang telah memiliki match aktif.',
            ]);
        }

        if ($category->format === EventFormatEnum::ROUND_ROBIN) {
            return $this->roundRobinAction->execute($category);
        }

        return $this->singleElimAction->execute($category);
    }
}
