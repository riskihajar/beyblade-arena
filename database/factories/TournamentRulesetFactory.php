<?php

namespace Database\Factories;

use App\Models\TournamentRuleset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TournamentRuleset>
 */
class TournamentRulesetFactory extends Factory
{
    protected $model = TournamentRuleset::class;

    public function definition(): array
    {
        return [
            'name' => 'Beyblade X Official Rule',
            'generation' => 'X',
            'points_to_win' => 4,
            'spin_finish_points' => 1,
            'over_finish_points' => 2,
            'burst_finish_points' => 2,
            'xtreme_finish_points' => 3,
            'penalty_points' => 1,
            'custom_rules_config' => null,
            'is_official' => true,
        ];
    }
}
