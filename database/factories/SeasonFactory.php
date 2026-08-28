<?php

namespace Database\Factories;

use App\Models\Season;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Season>
 */
class SeasonFactory extends Factory
{
    protected $model = Season::class;

    public function definition(): array
    {
        $name = 'Season ' . fake()->year();

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'start_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'formula_config' => [
                'tier_multipliers' => [
                    'major' => 1.5,
                    'regular' => 1.0,
                    'mini' => 0.5,
                ],
                'placement_points' => [
                    '1st' => 100,
                    '2nd' => 70,
                    '3rd' => 50,
                    '4th' => 30,
                    'top_8' => 15,
                    'participation' => 5,
                ],
            ],
            'is_active' => true,
        ];
    }
}
