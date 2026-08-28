<?php

namespace Database\Factories;

use App\Enums\EventStatusEnum;
use App\Models\Event;
use App\Models\Season;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $name = fake()->city() . ' Blader Championship ' . fake()->year();

        return [
            'season_id' => Season::factory(),
            'organizer_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'description' => fake()->paragraph(),
            'venue_name' => 'Atrium Mall Samarinda Central Plaza',
            'venue_address' => 'Jl. Mulawarman No. 1, Samarinda',
            'venue_city' => 'Samarinda',
            'venue_maps_url' => 'https://maps.google.com/?q=Samarinda',
            'banner_path' => null,
            'registration_start_at' => now()->subDays(7),
            'registration_end_at' => now()->addDays(7),
            'event_start_at' => now()->addDays(10),
            'event_end_at' => now()->addDays(10)->addHours(8),
            'status' => EventStatusEnum::REGISTRATION_OPEN,
            'entry_fee' => 25000.00,
            'tier_multiplier' => 1.00,
            'is_ranking_eligible' => true,
            'rules_and_regulations' => 'Wajib membawa Beyblade X original Takara Tomy.',
        ];
    }
}
