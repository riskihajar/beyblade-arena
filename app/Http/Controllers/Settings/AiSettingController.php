<?php

namespace App\Http\Controllers\Settings;

use App\Agents\ChatTitleAgent;
use App\Ai\AiProviderRegistry;
use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Models\AiProvider;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AiSettingController extends Controller
{
    use AuthorizesRequests;

    // ─── Provider CRUD ───────────────────────────────────────────

    public function providersIndex(Request $request): InertiaResponse
    {
        $this->authorize('admin.access');

        $providers = AiProvider::withCount('models')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (AiProvider $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'name' => $p->name,
                'driver' => $p->driver,
                'base_url' => $p->base_url,
                'is_active' => $p->is_active,
                'sort_order' => $p->sort_order,
                'models_count' => $p->models_count,
                'created_at' => $p->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('settings/ai/providers/index', [
            'providers' => $providers,
        ]);
    }

    public function providersCreate(): InertiaResponse
    {
        $this->authorize('admin.access');

        return Inertia::render('settings/ai/providers/create', [
            'drivers' => $this->availableDrivers(),
        ]);
    }

    public function providersStore(Request $request): RedirectResponse
    {
        $this->authorize('admin.access');

        $validated = $request->validate([
            'slug' => 'required|string|max:50|unique:ai_providers,slug|regex:/^[a-z0-9-]+$/',
            'name' => 'required|string|max:100',
            'driver' => 'required|string|in:openai,anthropic,openrouter,bedrock',
            'base_url' => 'nullable|url|max:255',
            'api_key' => 'nullable|string|max:500',
            'auth_type' => 'nullable|string|in:bearer,basic,none',
            'auth_username' => 'nullable|string|max:255',
            'auth_password' => 'nullable|string|max:255',
            'extra_config' => 'nullable|json',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $extraConfig = isset($validated['extra_config'])
            ? json_decode($validated['extra_config'], true) ?? []
            : [];

        $extraConfig['auth_type'] = $validated['auth_type'] ?? 'bearer';
        if (($extraConfig['auth_type'] ?? 'bearer') === 'basic') {
            $extraConfig['auth_username'] = $validated['auth_username'] ?? '';
            $extraConfig['auth_password'] = $validated['auth_password'] ?? '';
        }

        unset($validated['auth_type'], $validated['auth_username'], $validated['auth_password']);
        $validated['extra_config'] = $extraConfig;

        AiProvider::create($validated);
        AiProviderRegistry::clearCache();

        return to_route('settings.ai.providers.index')
            ->with('success', 'Provider created successfully.');
    }

    public function providersEdit(AiProvider $provider): InertiaResponse
    {
        $this->authorize('admin.access');

        $extraConfig = $provider->extra_config ?? [];

        return Inertia::render('settings/ai/providers/edit', [
            'provider' => [
                'id' => $provider->id,
                'slug' => $provider->slug,
                'name' => $provider->name,
                'driver' => $provider->driver,
                'base_url' => $provider->base_url,
                'api_key' => $provider->api_key ?? '',
                'auth_type' => $extraConfig['auth_type'] ?? 'bearer',
                'auth_username' => $extraConfig['auth_username'] ?? '',
                'auth_password' => $extraConfig['auth_password'] ?? '',
                'extra_config' => $provider->extra_config ? json_encode($provider->extra_config, JSON_PRETTY_PRINT) : '',
                'is_active' => $provider->is_active,
                'sort_order' => $provider->sort_order,
            ],
            'drivers' => $this->availableDrivers(),
        ]);
    }

    public function providersUpdate(Request $request, AiProvider $provider): RedirectResponse
    {
        $this->authorize('admin.access');

        $validated = $request->validate([
            'slug' => 'required|string|max:50|unique:ai_providers,slug,'.$provider->id.'|regex:/^[a-z0-9-]+$/',
            'name' => 'required|string|max:100',
            'driver' => 'required|string|in:openai,anthropic,openrouter,bedrock',
            'base_url' => 'nullable|url|max:255',
            'api_key' => 'nullable|string|max:500',
            'auth_type' => 'nullable|string|in:bearer,basic,none',
            'auth_username' => 'nullable|string|max:255',
            'auth_password' => 'nullable|string|max:255',
            'extra_config' => 'nullable|json',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Don't overwrite api key if not provided
        if (empty($validated['api_key'])) {
            unset($validated['api_key']);
        }

        $extraConfig = isset($validated['extra_config'])
            ? json_decode($validated['extra_config'], true) ?? []
            : ($provider->extra_config ?? []);

        $extraConfig['auth_type'] = $validated['auth_type'] ?? 'bearer';
        if (($extraConfig['auth_type'] ?? 'bearer') === 'basic') {
            $extraConfig['auth_username'] = $validated['auth_username'] ?? '';
            $extraConfig['auth_password'] = $validated['auth_password'] ?? '';
        } else {
            unset($extraConfig['auth_username'], $extraConfig['auth_password']);
        }

        unset($validated['auth_type'], $validated['auth_username'], $validated['auth_password']);
        $validated['extra_config'] = $extraConfig;

        $provider->update($validated);
        AiProviderRegistry::clearCache();

        return to_route('settings.ai.providers.index')
            ->with('success', 'Provider updated successfully.');
    }

    public function providersDestroy(AiProvider $provider): RedirectResponse
    {
        $this->authorize('admin.access');

        $provider->delete();
        AiProviderRegistry::clearCache();

        return to_route('settings.ai.providers.index')
            ->with('success', 'Provider deleted successfully.');
    }

    public function providersTestConnection(AiProvider $provider): JsonResponse
    {
        $this->authorize('admin.access');

        if ($provider->driver === 'bedrock') {
            return $this->testBedrockConnection($provider);
        }

        try {
            $baseUrl = rtrim($provider->base_url ?? $this->defaultBaseUrl($provider->driver), '/');
            $http = $this->buildProviderHttpClient($provider, 10);

            $response = $http->get("{$baseUrl}/models");

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Connection successful.',
                ]);
            }

            $body = $response->json();
            $errorMessage = $body['error']['message']
                ?? $body['error']['type']
                ?? $body['message']
                ?? "HTTP {$response->status()}";

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
            ], 422);
        } catch (ConnectionException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: could not reach the server.',
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unexpected error: '.$e->getMessage(),
            ], 500);
        }
    }

    public function providersListModels(AiProvider $provider): JsonResponse
    {
        $this->authorize('admin.access');

        if ($provider->driver === 'bedrock') {
            return response()->json([
                'success' => false,
                'message' => 'Model listing is not available for native Bedrock providers yet. Add model IDs manually.',
            ], 422);
        }

        try {
            $baseUrl = rtrim($provider->base_url ?? $this->defaultBaseUrl($provider->driver), '/');
            $http = $this->buildProviderHttpClient($provider, 15);

            $query = $provider->driver === 'anthropic' ? ['limit' => 100] : [];
            $response = $http->get("{$baseUrl}/models", $query);

            if (! $response->successful()) {
                $body = $response->json();
                $errorMessage = $body['error']['message']
                    ?? $body['error']['type']
                    ?? $body['message']
                    ?? "HTTP {$response->status()}";

                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }

            $body = $response->json();
            $rawModels = $body['data'] ?? [];

            $models = collect($rawModels)
                ->map(fn (array $m) => [
                    'id' => $m['id'],
                    'name' => $m['display_name'] ?? $m['name'] ?? $m['id'],
                ])
                ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
                ->values()
                ->all();

            return response()->json(['success' => true, 'models' => $models]);
        } catch (ConnectionException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: could not reach the server.',
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unexpected error: '.$e->getMessage(),
            ], 500);
        }
    }

    // ─── Model CRUD ──────────────────────────────────────────────

    public function modelsIndex(Request $request): InertiaResponse
    {
        $this->authorize('admin.access');

        $models = AiModel::with('provider:id,slug,name')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (AiModel $m) => [
                'id' => $m->id,
                'model_id' => $m->model_id,
                'name' => $m->name,
                'provider_name' => $m->provider?->name,
                'provider_slug' => $m->provider?->slug,
                'supports_web_search' => $m->supports_web_search,
                'supports_attachments' => $m->supports_attachments,
                'supports_images' => $m->supports_images,
                'supports_documents' => $m->supports_documents,
                'supports_provider_storage' => $m->supports_provider_storage,
                'is_default' => $m->is_default,
                'is_active' => $m->is_active,
                'sort_order' => $m->sort_order,
            ]);

        return Inertia::render('settings/ai/models/index', [
            'models' => $models,
        ]);
    }

    public function modelsCreate(): InertiaResponse
    {
        $this->authorize('admin.access');

        return Inertia::render('settings/ai/models/create', [
            'providers' => $this->providerOptions(),
        ]);
    }

    public function modelsStore(Request $request): RedirectResponse
    {
        $this->authorize('admin.access');

        $validated = $request->validate([
            'ai_provider_id' => 'required|exists:ai_providers,id',
            'model_id' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'supports_web_search' => 'boolean',
            'supports_attachments' => 'boolean',
            'supports_images' => 'boolean',
            'supports_documents' => 'boolean',
            'supports_provider_storage' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validated['is_default'] ?? false) {
            AiModel::where('is_default', true)->update(['is_default' => false]);
        }

        AiModel::create($validated);
        AiProviderRegistry::clearCache();

        return to_route('settings.ai.models.index')
            ->with('success', 'Model created successfully.');
    }

    public function modelsEdit(AiModel $model): InertiaResponse
    {
        $this->authorize('admin.access');

        return Inertia::render('settings/ai/models/edit', [
            'model' => [
                'id' => $model->id,
                'ai_provider_id' => $model->ai_provider_id,
                'model_id' => $model->model_id,
                'name' => $model->name,
                'supports_web_search' => $model->supports_web_search,
                'supports_attachments' => $model->supports_attachments,
                'supports_images' => $model->supports_images,
                'supports_documents' => $model->supports_documents,
                'supports_provider_storage' => $model->supports_provider_storage,
                'is_default' => $model->is_default,
                'is_active' => $model->is_active,
                'sort_order' => $model->sort_order,
            ],
            'providers' => $this->providerOptions(),
        ]);
    }

    public function modelsUpdate(Request $request, AiModel $model): RedirectResponse
    {
        $this->authorize('admin.access');

        $validated = $request->validate([
            'ai_provider_id' => 'required|exists:ai_providers,id',
            'model_id' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'supports_web_search' => 'boolean',
            'supports_attachments' => 'boolean',
            'supports_images' => 'boolean',
            'supports_documents' => 'boolean',
            'supports_provider_storage' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if (($validated['is_default'] ?? false) && ! $model->is_default) {
            AiModel::where('is_default', true)->update(['is_default' => false]);
        }

        $model->update($validated);
        AiProviderRegistry::clearCache();

        return to_route('settings.ai.models.index')
            ->with('success', 'Model updated successfully.');
    }

    public function modelsDestroy(AiModel $model): RedirectResponse
    {
        $this->authorize('admin.access');

        $model->delete();
        AiProviderRegistry::clearCache();

        return to_route('settings.ai.models.index')
            ->with('success', 'Model deleted successfully.');
    }

    // ─── Toggle Active ──────────────────────────────────────────

    public function providersToggleActive(Request $request): RedirectResponse
    {
        $this->authorize('admin.access');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|string|exists:ai_providers,id',
            'is_active' => 'required|boolean',
        ]);

        AiProvider::whereIn('id', $validated['ids'])
            ->update(['is_active' => $validated['is_active']]);

        AiProviderRegistry::clearCache();

        $count = count($validated['ids']);
        $action = $validated['is_active'] ? 'enabled' : 'disabled';

        return back()->with('success', "{$count} provider(s) {$action} successfully.");
    }

    public function modelsToggleActive(Request $request): RedirectResponse
    {
        $this->authorize('admin.access');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|string|exists:ai_models,id',
            'is_active' => 'required|boolean',
        ]);

        AiModel::whereIn('id', $validated['ids'])
            ->update(['is_active' => $validated['is_active']]);

        AiProviderRegistry::clearCache();

        $count = count($validated['ids']);
        $action = $validated['is_active'] ? 'enabled' : 'disabled';

        return back()->with('success', "{$count} model(s) {$action} successfully.");
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function availableDrivers(): array
    {
        return [
            ['value' => 'openai', 'label' => 'OpenAI'],
            ['value' => 'anthropic', 'label' => 'Anthropic'],
            ['value' => 'openrouter', 'label' => 'OpenRouter (LiteLLM / BAG)'],
            ['value' => 'bedrock', 'label' => 'AWS Bedrock (Native)'],
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function providerOptions(): array
    {
        return AiProvider::orderBy('sort_order')
            ->get()
            ->map(fn (AiProvider $p) => [
                'value' => $p->id,
                'label' => $p->name,
            ])
            ->all();
    }

    private function defaultBaseUrl(string $driver): string
    {
        return match ($driver) {
            'openai' => 'https://api.openai.com/v1',
            'anthropic' => 'https://api.anthropic.com/v1',
            'openrouter' => 'https://openrouter.ai/api/v1',
            'bedrock' => '',
            default => '',
        };
    }

    /**
     * Build an HTTP client with the correct auth for the provider.
     */
    private function buildProviderHttpClient(AiProvider $provider, int $timeout = 10): PendingRequest
    {
        $extraConfig = $provider->extra_config ?? [];
        $authType = $extraConfig['auth_type'] ?? 'bearer';

        $http = Http::connectTimeout(5)->timeout($timeout);

        // Add driver-specific headers
        if ($provider->driver === 'anthropic' && $authType !== 'basic') {
            return $http->withHeaders([
                'x-api-key' => $provider->api_key ?? '',
                'anthropic-version' => '2023-06-01',
            ]);
        }

        if ($provider->driver === 'bedrock') {
            return $http;
        }

        return match ($authType) {
            'basic' => $http->withBasicAuth(
                $extraConfig['auth_username'] ?? '',
                $extraConfig['auth_password'] ?? '',
            ),
            'none' => $http,
            default => $http->withToken($provider->api_key ?? ''),
        };
    }

    private function testBedrockConnection(AiProvider $provider): JsonResponse
    {
        try {
            config([
                "ai.providers.{$provider->slug}" => $provider->toPrismConfig(),
            ]);

            $response = ChatTitleAgent::make()->prompt(
                'Return exactly two words that confirm the connection works.',
                provider: $provider->slug,
                model: 'us.anthropic.claude-sonnet-4-6',
            );

            return response()->json([
                'success' => true,
                'message' => 'Connection successful: '.trim($response->text ?? (string) $response),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bedrock connection failed: '.$e->getMessage(),
            ], 422);
        }
    }
}
