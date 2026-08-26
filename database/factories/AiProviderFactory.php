<?php

namespace Database\Factories;

use App\Models\AiProvider;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AiProvider>
 */
class AiProviderFactory extends Factory
{
    protected $model = AiProvider::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $slug = Str::lower(Str::random(8));

        return [
            'slug' => $slug,
            'name' => 'Provider '.Str::upper($slug),
            'driver' => 'openai',
            'base_url' => 'https://api.example.com/v1',
            'api_key' => 'sk-test-'.Str::random(16),
            'extra_config' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
