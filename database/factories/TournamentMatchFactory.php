<?php

namespace Database\Factories;

use App\Enums\MatchStatusEnum;
use App\Models\Registration;
use App\Models\Stadium;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TournamentMatch>
 */
class TournamentMatchFactory extends Factory
{
    protected $model = TournamentMatch::class;

    public function definition(): array
    {
        return [
            'category_id' => TournamentCategory::factory(),
            'stadium_id' => Stadium::factory(),
            'judge_id' => User::factory(),
            'round_number' => 1,
            'match_order' => 1,
            'group_code' => null,
            'bracket_type' => 'winners',
            'player1_id' => Registration::factory(),
            'player2_id' => Registration::factory(),
            'winner_id' => null,
            'player1_score' => 0,
            'player2_score' => 0,
            'status' => MatchStatusEnum::SCHEDULED,
            'called_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'ruleset_snapshot' => [
                'points_to_win' => 4,
                'spin_finish_points' => 1,
                'over_finish_points' => 2,
                'burst_finish_points' => 2,
                'xtreme_finish_points' => 3,
            ],
            'is_disputed' => false,
            'dispute_reason' => null,
        ];
    }
}
