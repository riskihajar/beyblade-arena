<?php

namespace Database\Factories;

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Models\Event;
use App\Models\TournamentCategory;
use App\Models\TournamentRuleset;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TournamentCategory>
 */
class TournamentCategoryFactory extends Factory
{
    protected $model = TournamentCategory::class;

    public function definition(): array
    {
        $name = fake()->randomElement(['Open Master Division', 'Junior Division (U-12)', 'Deck 3v3 Division']);

        return [
            'event_id' => Event::factory(),
            'ruleset_id' => TournamentRuleset::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'min_age' => null,
            'max_age' => null,
            'max_participants' => 32,
            'format' => EventFormatEnum::SINGLE_ELIMINATION,
            'stage_config' => [
                'type' => 'single_elimination',
                'target_points' => 4,
            ],
            'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN,
            'tie_breaker_priority' => [
                'match_points',
                'head_to_head',
                'battle_points_diff',
                'battle_points_won',
                'fewest_penalties',
            ],
            'call_timeout_seconds' => 180,
            'target_points' => 4,
        ];
    }
}
