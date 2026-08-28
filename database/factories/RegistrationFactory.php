<?php

namespace Database\Factories;

use App\Enums\RegistrationStatusEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Registration>
 */
class RegistrationFactory extends Factory
{
    protected $model = Registration::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'category_id' => TournamentCategory::factory(),
            'user_id' => User::factory(),
            'display_nickname' => fake()->userName(),
            'seed_number' => fake()->numberBetween(1, 32),
            'group_code' => null,
            'status' => RegistrationStatusEnum::CONFIRMED,
            'deck_data' => [
                [
                    'blade' => 'Dran Sword',
                    'ratchet' => '3-60',
                    'bit' => 'Flat',
                ],
                [
                    'blade' => 'Hells Scythe',
                    'ratchet' => '4-60',
                    'bit' => 'Ball',
                ],
                [
                    'blade' => 'Wizard Rod',
                    'ratchet' => '5-70',
                    'bit' => 'Hexa',
                ],
            ],
            'is_deck_locked' => false,
            'guardian_details' => [
                'guardian_name' => fake()->name(),
                'guardian_phone' => '0812' . fake()->numerify('########'),
                'relationship' => 'Orang Tua',
            ],
            'checked_in_at' => null,
            'disqualified_reason' => null,
        ];
    }
}
