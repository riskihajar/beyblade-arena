<?php

namespace Database\Factories;

use App\Enums\StadiumStatusEnum;
use App\Models\Event;
use App\Models\Stadium;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stadium>
 */
class StadiumFactory extends Factory
{
    protected $model = Stadium::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'assigned_judge_id' => User::factory(),
            'name' => 'Stadium '.fake()->unique()->randomLetter(),
            'model_type' => 'Extreme Stadium BX-07/10',
            'status' => StadiumStatusEnum::AVAILABLE,
            'notes' => null,
        ];
    }
}
