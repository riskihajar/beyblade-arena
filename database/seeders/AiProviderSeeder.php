<?php

namespace Database\Seeders;

use App\Models\AiModel;
use App\Models\AiProvider;
use Illuminate\Database\Seeder;

class AiProviderSeeder extends Seeder
{
    public function run(): void
    {
        $providers = [
            [
                'slug' => 'openai',
                'name' => 'OpenAI',
                'driver' => 'openai',
                'base_url' => null,
                'api_key' => config('ai.providers.openai.key'),
                'extra_config' => null,
                'is_active' => true,
                'sort_order' => 0,
                'models' => [
                    ['model_id' => 'gpt-4o', 'name' => 'GPT-4o', 'supports_web_search' => false, 'supports_provider_storage' => true, 'sort_order' => 0],
                    ['model_id' => 'gpt-5-mini', 'name' => 'GPT-5 Mini', 'supports_web_search' => true, 'supports_provider_storage' => true, 'sort_order' => 1],
                    ['model_id' => 'gpt-5.2', 'name' => 'GPT-5.2', 'supports_web_search' => true, 'supports_provider_storage' => true, 'is_default' => true, 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'bedrock-access-gateway',
                'name' => 'AWS Bedrock (BAG)',
                'driver' => 'openrouter',
                'base_url' => config('ai.providers.bedrock-access-gateway.url'),
                'api_key' => config('ai.providers.bedrock-access-gateway.key'),
                'extra_config' => null,
                'is_active' => ! empty(config('ai.providers.bedrock-access-gateway.key')),
                'sort_order' => 1,
                'models' => [
                    ['model_id' => 'global.anthropic.claude-sonnet-4-5-20250929-v1:0', 'name' => 'Claude Sonnet 4.5 (BAG)', 'sort_order' => 0],
                    ['model_id' => 'global.anthropic.claude-opus-4-5-20251101-v1:0', 'name' => 'Claude Opus 4.5 (BAG)', 'sort_order' => 1],
                ],
            ],
            [
                'slug' => 'bedrock',
                'name' => 'AWS Bedrock (Native)',
                'driver' => 'bedrock',
                'base_url' => null,
                'api_key' => config('ai.providers.bedrock.key'),
                'extra_config' => [
                    'region' => config('ai.providers.bedrock.region', 'us-east-1'),
                    'access_key_id' => config('ai.providers.bedrock.access_key_id'),
                    'secret_access_key' => config('ai.providers.bedrock.secret_access_key'),
                    'session_token' => config('ai.providers.bedrock.session_token'),
                    'use_default_credential_provider' => config('ai.providers.bedrock.use_default_credential_provider', true),
                ],
                'is_active' => ! empty(config('ai.providers.bedrock.access_key_id'))
                    || ! empty(config('ai.providers.bedrock.key')),
                'sort_order' => 2,
                'models' => [
                    ['model_id' => 'us.anthropic.claude-sonnet-4-6', 'name' => 'Claude Sonnet 4.6 (Bedrock)', 'is_default' => true, 'sort_order' => 0],
                    ['model_id' => 'us.anthropic.claude-opus-4-5-20251101-v1:0', 'name' => 'Claude Opus 4.5 (Bedrock)', 'sort_order' => 1],
                    ['model_id' => 'amazon.titan-embed-text-v2:0', 'name' => 'Titan Embed Text v2', 'supports_web_search' => false, 'supports_attachments' => false, 'supports_images' => false, 'supports_documents' => false, 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'bifrost',
                'name' => 'AWS Bedrock (Bifrost)',
                'driver' => 'anthropic',
                'base_url' => config('ai.providers.bifrost.url', 'http://localhost:8880/anthropic/v1'),
                'api_key' => config('ai.providers.bifrost.key', 'sk-bifrost'),
                'extra_config' => ['version' => '2023-06-01'],
                'is_active' => ! empty(config('ai.providers.bifrost.key')),
                'sort_order' => 3,
                'models' => [
                    ['model_id' => 'bedrock/global.anthropic.claude-sonnet-4-6', 'name' => 'Claude Sonnet 4', 'sort_order' => 0],
                    ['model_id' => 'bedrock/global.anthropic.claude-opus-4-6-v1', 'name' => 'Claude Opus 4', 'sort_order' => 1],
                ],
            ],
            [
                'slug' => 'litellm',
                'name' => 'LiteLLM',
                'driver' => 'openrouter',
                'base_url' => config('ai.providers.litellm.url', 'http://localhost:4000/v1'),
                'api_key' => config('ai.providers.litellm.key'),
                'extra_config' => null,
                'is_active' => ! empty(config('ai.providers.litellm.key')),
                'sort_order' => 4,
                'models' => [
                    ['model_id' => 'claude-sonnet', 'name' => 'Claude Sonnet', 'sort_order' => 0],
                    ['model_id' => 'claude-opus', 'name' => 'Claude Opus', 'sort_order' => 1],
                ],
            ],
        ];

        foreach ($providers as $providerData) {
            $models = $providerData['models'];
            unset($providerData['models']);

            $provider = AiProvider::updateOrCreate(
                ['slug' => $providerData['slug']],
                $providerData,
            );

            foreach ($models as $modelData) {
                AiModel::updateOrCreate(
                    [
                        'ai_provider_id' => $provider->id,
                        'model_id' => $modelData['model_id'],
                    ],
                    array_merge([
                        'supports_web_search' => false,
                        'supports_attachments' => true,
                        'supports_images' => true,
                        'supports_documents' => true,
                        'supports_provider_storage' => false,
                        'is_default' => false,
                        'is_active' => true,
                    ], $modelData),
                );
            }
        }
    }
}
