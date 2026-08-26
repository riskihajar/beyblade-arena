<?php

namespace App\Ai;

use App\Enums\ChatModel;
use App\Models\AiModel as AiModelEloquent;
use App\Models\AiProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class AiProviderRegistry
{
    private static bool $booted = false;

    /**
     * Register all active DB providers as Prism providers at runtime.
     */
    public static function registerProviders(): void
    {
        if (static::$booted) {
            return;
        }

        $providers = Cache::remember('ai_providers_config', 300, function () {
            if (! self::tableExists()) {
                return [];
            }

            return AiProvider::active()
                ->orderBy('sort_order')
                ->get()
                ->mapWithKeys(fn (AiProvider $p) => [$p->slug => $p->toPrismConfig()])
                ->all();
        });

        foreach ($providers as $slug => $config) {
            config(["ai.providers.{$slug}" => $config]);
        }

        static::$booted = true;
    }

    /**
     * Get grouped model options for the chat interface.
     *
     * @return array<int, array{provider: string, provider_label: string, models: array<int, array{value: string, label: string, supports_web_search: bool, supports_attachments: bool, supports_images: bool, supports_documents: bool}>}>
     */
    public static function groupedOptions(): array
    {
        if (! self::tableExists()) {
            return [];
        }

        return Cache::remember('ai_models_grouped', 300, function () {
            return AiModelEloquent::groupedOptions();
        });
    }

    /**
     * Get the default model ID string.
     */
    public static function defaultModelId(): string
    {
        if (! self::tableExists()) {
            return ChatModel::default()->value;
        }

        return Cache::remember('ai_default_model', 300, function () {
            $preferredBedrockModel = AiModelEloquent::active()
                ->whereHas('provider', fn ($query) => $query->where('slug', 'bedrock'))
                ->where('model_id', 'us.anthropic.claude-sonnet-4-6')
                ->first();

            $model = $preferredBedrockModel ?? AiModelEloquent::defaultModel();

            return $model?->model_id ?? ChatModel::default()->value;
        });
    }

    /**
     * Resolve a model from its model_id string. Returns null if not found.
     */
    public static function resolveModel(string $modelId): ?AiModelEloquent
    {
        if (! self::tableExists()) {
            return null;
        }

        return AiModelEloquent::findByModelId($modelId);
    }

    /**
     * Get all valid model IDs for validation.
     *
     * @return array<int, string>
     */
    public static function validModelIds(): array
    {
        $enumIds = array_column(ChatModel::cases(), 'value');

        if (! self::tableExists()) {
            return $enumIds;
        }

        return Cache::remember('ai_valid_model_ids', 300, function () use ($enumIds) {
            $dbIds = AiModelEloquent::active()->pluck('model_id')->all();

            return array_values(array_unique(array_merge($dbIds, $enumIds)));
        });
    }

    /**
     * Clear all cached AI provider/model data.
     */
    public static function clearCache(): void
    {
        Cache::forget('ai_providers_config');
        Cache::forget('ai_models_grouped');
        Cache::forget('ai_default_model');
        Cache::forget('ai_valid_model_ids');

        static::$booted = false;
    }

    private static function tableExists(): bool
    {
        try {
            return Schema::hasTable('ai_providers');
        } catch (\Throwable) {
            return false;
        }
    }
}
