<?php

namespace Database\Factories;

use App\Models\Season;
use App\Models\SeasonRanking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SeasonRanking>
 */
class SeasonRankingFactory extends Factory
{
    protected $model = SeasonRanking::class;

    public function definition(): array
    {
        return [
            'season_id' => Season::factory(),
            'user_id' => User::factory(),
            'total_points' => fake()->numberBetween(10, 500),
            'rank_position' => fake()->numberBetween(1, 50),
            'tournaments_played' => fake()->numberBetween(1, 10),
            'tournaments_won' => fake()->numberBetween(0, 3),
            'matches_won' => fake()->numberBetween(0, 20),
            'matches_lost' => fake()->numberBetween(0, 10),
            'details' => null,
        ];
    }
}
