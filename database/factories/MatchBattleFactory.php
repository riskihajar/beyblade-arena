<?php

namespace Database\Factories;

use App\Enums\MatchFinishTypeEnum;
use App\Models\MatchBattle;
use App\Models\Registration;
use App\Models\TournamentMatch;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MatchBattle>
 */
class MatchBattleFactory extends Factory
{
    protected $model = MatchBattle::class;

    public function definition(): array
    {
        return [
            'match_id' => TournamentMatch::factory(),
            'battle_number' => 1,
            'winner_id' => Registration::factory(),
            'finish_type' => MatchFinishTypeEnum::SPIN_FINISH,
            'points_awarded' => 1,
            'player1_points_after' => 1,
            'player2_points_after' => 0,
            'is_draw' => false,
            'notes' => null,
            'client_request_id' => Str::uuid()->toString(),
        ];
    }
}
