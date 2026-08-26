<?php

use App\Ai\AiProviderRegistry;
use App\Models\AiModel;
use App\Models\AiProvider;
use Illuminate\Support\Facades\DB;

// --- AiProvider Tests ---

test('ai provider has models relationship', function () {
    $provider = AiProvider::factory()->create();
    $model = AiModel::factory()->create(['ai_provider_id' => $provider->id]);

    expect($provider->models)->toHaveCount(1);
    expect($provider->models->first()->id)->toBe($model->id);
});

test('ai provider active scope filters inactive providers', function () {
    AiProvider::factory()->create(['is_active' => true]);
    AiProvider::factory()->create(['is_active' => false]);

    expect(AiProvider::active()->count())->toBe(1);
});

test('ai provider active models relationship filters inactive models', function () {
    $provider = AiProvider::factory()->create();
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'is_active' => true]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'is_active' => false]);

    expect($provider->activeModels)->toHaveCount(1);
});

test('ai provider to prism config includes driver and key', function () {
    $provider = AiProvider::factory()->create([
        'driver' => 'openai',
        'api_key' => 'sk-test-key',
        'base_url' => 'https://api.example.com/v1',
    ]);

    $config = $provider->toPrismConfig();

    expect($config['driver'])->toBe('openai');
    expect($config['key'])->toBe('sk-test-key');
    expect($config['url'])->toBe('https://api.example.com/v1');
});

test('ai provider to prism config merges extra config', function () {
    $provider = AiProvider::factory()->create([
        'driver' => 'anthropic',
        'extra_config' => ['version' => '2023-06-01'],
    ]);

    $config = $provider->toPrismConfig();

    expect($config['version'])->toBe('2023-06-01');
});

test('ai provider to prism config includes native bedrock credentials', function () {
    $provider = AiProvider::factory()->create([
        'driver' => 'bedrock',
        'api_key' => 'bearer-bedrock-token',
        'extra_config' => [
            'region' => 'us-east-1',
            'access_key_id' => 'AKIA_TEST',
            'secret_access_key' => 'secret-test',
            'session_token' => 'session-test',
            'use_default_credential_provider' => false,
        ],
    ]);

    $config = $provider->toPrismConfig();

    expect($config['driver'])->toBe('bedrock');
    expect($config['key'])->toBe('bearer-bedrock-token');
    expect($config['region'])->toBe('us-east-1');
    expect($config['access_key_id'])->toBe('AKIA_TEST');
    expect($config['secret_access_key'])->toBe('secret-test');
    expect($config['session_token'])->toBe('session-test');
    expect($config['use_default_credential_provider'])->toBeFalse();
});

test('ai provider api key is encrypted', function () {
    $provider = AiProvider::factory()->create(['api_key' => 'sk-secret-key']);

    // Verify it decrypts correctly through the model
    expect($provider->api_key)->toBe('sk-secret-key');

    // Verify it's stored encrypted in the database
    $raw = DB::table('ai_providers')
        ->where('id', $provider->id)
        ->value('api_key');

    expect($raw)->not->toBe('sk-secret-key');
});

test('ai provider cascades delete to models', function () {
    $provider = AiProvider::factory()->create();
    AiModel::factory()->count(3)->create(['ai_provider_id' => $provider->id]);

    expect(AiModel::count())->toBe(3);

    $provider->delete();

    expect(AiModel::count())->toBe(0);
});

// --- AiModel Tests ---

test('ai model belongs to provider', function () {
    $provider = AiProvider::factory()->create();
    $model = AiModel::factory()->create(['ai_provider_id' => $provider->id]);

    expect($model->provider->id)->toBe($provider->id);
});

test('ai model active scope requires both model and provider to be active', function () {
    $activeProvider = AiProvider::factory()->create(['is_active' => true]);
    $inactiveProvider = AiProvider::factory()->create(['is_active' => false]);

    AiModel::factory()->create(['ai_provider_id' => $activeProvider->id, 'is_active' => true]);
    AiModel::factory()->create(['ai_provider_id' => $activeProvider->id, 'is_active' => false]);
    AiModel::factory()->create(['ai_provider_id' => $inactiveProvider->id, 'is_active' => true]);

    expect(AiModel::active()->count())->toBe(1);
});

test('ai model by provider scope filters by provider slug', function () {
    $providerA = AiProvider::factory()->create(['slug' => 'provider-a']);
    $providerB = AiProvider::factory()->create(['slug' => 'provider-b']);

    AiModel::factory()->count(2)->create(['ai_provider_id' => $providerA->id]);
    AiModel::factory()->count(3)->create(['ai_provider_id' => $providerB->id]);

    expect(AiModel::byProvider('provider-a')->count())->toBe(2);
    expect(AiModel::byProvider('provider-b')->count())->toBe(3);
});

test('ai model default model returns is_default model', function () {
    $provider = AiProvider::factory()->create(['is_active' => true]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'model_id' => 'model-a', 'is_default' => false]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'model_id' => 'model-b', 'is_default' => true]);

    expect(AiModel::defaultModel()->model_id)->toBe('model-b');
});

test('ai model default model falls back to first active model', function () {
    $provider = AiProvider::factory()->create(['is_active' => true]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'model_id' => 'model-a', 'sort_order' => 0]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'model_id' => 'model-b', 'sort_order' => 1]);

    expect(AiModel::defaultModel()->model_id)->toBe('model-a');
});

test('ai provider registry prefers active native bedrock sonnet model as default', function () {
    $openAiProvider = AiProvider::factory()->create([
        'slug' => 'openai',
        'is_active' => true,
    ]);

    AiModel::factory()->create([
        'ai_provider_id' => $openAiProvider->id,
        'model_id' => 'gpt-5.2',
        'is_default' => true,
        'sort_order' => 0,
    ]);

    $bedrockProvider = AiProvider::factory()->create([
        'slug' => 'bedrock',
        'driver' => 'bedrock',
        'is_active' => true,
    ]);

    AiModel::factory()->create([
        'ai_provider_id' => $bedrockProvider->id,
        'model_id' => 'us.anthropic.claude-sonnet-4-6',
        'name' => 'Claude Sonnet 4.6 (Bedrock)',
        'is_default' => true,
        'sort_order' => 1,
    ]);

    AiProviderRegistry::clearCache();

    expect(AiProviderRegistry::defaultModelId())
        ->toBe('us.anthropic.claude-sonnet-4-6');
});

test('ai model find by model id returns correct model', function () {
    $provider = AiProvider::factory()->create();
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'model_id' => 'gpt-5.2']);

    $found = AiModel::findByModelId('gpt-5.2');

    expect($found)->not->toBeNull();
    expect($found->model_id)->toBe('gpt-5.2');
});

test('ai model find by model id returns null for missing model', function () {
    expect(AiModel::findByModelId('nonexistent'))->toBeNull();
});

test('ai model grouped options groups by provider', function () {
    $providerA = AiProvider::factory()->create(['slug' => 'openai', 'name' => 'OpenAI', 'is_active' => true]);
    $providerB = AiProvider::factory()->create(['slug' => 'litellm', 'name' => 'LiteLLM', 'is_active' => true]);

    AiModel::factory()->count(2)->create(['ai_provider_id' => $providerA->id]);
    AiModel::factory()->count(3)->create(['ai_provider_id' => $providerB->id]);

    $groups = AiModel::groupedOptions();

    expect($groups)->toHaveCount(2);

    $openaiGroup = collect($groups)->firstWhere('provider', 'openai');
    expect($openaiGroup['provider_label'])->toBe('OpenAI');
    expect($openaiGroup['models'])->toHaveCount(2);

    $litellmGroup = collect($groups)->firstWhere('provider', 'litellm');
    expect($litellmGroup['provider_label'])->toBe('LiteLLM');
    expect($litellmGroup['models'])->toHaveCount(3);
});

test('ai model grouped options excludes inactive models', function () {
    $provider = AiProvider::factory()->create(['is_active' => true]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'is_active' => true]);
    AiModel::factory()->create(['ai_provider_id' => $provider->id, 'is_active' => false]);

    $groups = AiModel::groupedOptions();

    expect($groups)->toHaveCount(1);
    expect($groups[0]['models'])->toHaveCount(1);
});

test('ai model grouped options excludes inactive providers', function () {
    $activeProvider = AiProvider::factory()->create(['is_active' => true]);
    $inactiveProvider = AiProvider::factory()->create(['is_active' => false]);

    AiModel::factory()->create(['ai_provider_id' => $activeProvider->id]);
    AiModel::factory()->create(['ai_provider_id' => $inactiveProvider->id]);

    $groups = AiModel::groupedOptions();

    expect($groups)->toHaveCount(1);
});

test('ai model grouped options includes capability fields', function () {
    $provider = AiProvider::factory()->create(['is_active' => true]);
    AiModel::factory()->create([
        'ai_provider_id' => $provider->id,
        'supports_web_search' => true,
        'supports_attachments' => true,
        'supports_images' => false,
        'supports_documents' => true,
    ]);

    $groups = AiModel::groupedOptions();
    $model = $groups[0]['models'][0];

    expect($model)->toHaveKey('supports_web_search');
    expect($model)->toHaveKey('supports_attachments');
    expect($model)->toHaveKey('supports_images');
    expect($model)->toHaveKey('supports_documents');
    expect($model['supports_web_search'])->toBeTrue();
    expect($model['supports_images'])->toBeFalse();
});
