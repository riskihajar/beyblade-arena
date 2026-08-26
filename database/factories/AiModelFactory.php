<?php

namespace Database\Factories;

use App\Models\AiModel;
use App\Models\AiProvider;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AiModel>
 */
class AiModelFactory extends Factory
{
    protected $model = AiModel::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ai_provider_id' => AiProvider::factory(),
            'model_id' => 'model-'.Str::lower(Str::random(8)),
            'name' => 'Model '.Str::random(6),
            'supports_web_search' => false,
            'supports_attachments' => true,
            'supports_images' => true,
            'supports_documents' => true,
            'supports_provider_storage' => false,
            'is_default' => false,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function default(): static
    {
        return $this->state(fn () => ['is_default' => true]);
    }

    public function withWebSearch(): static
    {
        return $this->state(fn () => ['supports_web_search' => true]);
    }

    public function withProviderStorage(): static
    {
        return $this->state(fn () => ['supports_provider_storage' => true]);
    }
}
