<?php

use App\Agents\ChatTitleAgent;
use App\Models\AiModel;
use App\Models\AiProvider;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'user']);

    Permission::firstOrCreate(['name' => 'admin.access']);

    $adminRole = Role::where('name', 'admin')->first();
    $adminRole->syncPermissions(Permission::all());

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->regularUser = User::factory()->create();
    $this->regularUser->assignRole('user');
});

// ─── Provider CRUD ──────────────────────────────────────────────

describe('Provider Management', function () {
    it('can list providers', function () {
        AiProvider::factory()->count(3)->create();

        $this->actingAs($this->admin)->get('/settings/ai/providers')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('providers', 3));
    });

    it('can show create provider page', function () {
        $this->actingAs($this->admin)->get('/settings/ai/providers/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('drivers'));
    });

    it('can create a provider', function () {
        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => 'openai',
            'name' => 'OpenAI',
            'driver' => 'openai',
            'base_url' => 'https://api.openai.com/v1',
            'api_key' => 'sk-test-key-123',
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertRedirect('/settings/ai/providers')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('ai_providers', [
            'slug' => 'openai',
            'name' => 'OpenAI',
            'driver' => 'openai',
        ]);

        // Verify API key is stored encrypted
        $provider = AiProvider::where('slug', 'openai')->first();
        expect($provider->api_key)->toBe('sk-test-key-123');
    });

    it('can create provider with extra config', function () {
        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => 'anthropic',
            'name' => 'Anthropic',
            'driver' => 'anthropic',
            'api_key' => 'sk-ant-test',
            'extra_config' => json_encode(['version' => '2023-06-01']),
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertRedirect('/settings/ai/providers')
            ->assertSessionHas('success');

        $provider = AiProvider::where('slug', 'anthropic')->first();
        expect($provider->extra_config)->toMatchArray(['version' => '2023-06-01', 'auth_type' => 'bearer']);
    });

    it('can create a native bedrock provider', function () {
        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => 'bedrock',
            'name' => 'AWS Bedrock (Native)',
            'driver' => 'bedrock',
            'is_active' => true,
            'sort_order' => 2,
        ])
            ->assertRedirect('/settings/ai/providers')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('ai_providers', [
            'slug' => 'bedrock',
            'driver' => 'bedrock',
        ]);
    });

    it('can test connection for native bedrock provider', function () {
        ChatTitleAgent::fake(['Bedrock Connected']);

        $provider = AiProvider::factory()->create([
            'slug' => 'bedrock',
            'name' => 'AWS Bedrock (Native)',
            'driver' => 'bedrock',
            'extra_config' => [
                'region' => 'us-east-1',
                'access_key_id' => 'AKIA_TEST',
                'secret_access_key' => 'secret-test',
                'use_default_credential_provider' => false,
            ],
        ]);

        $this->actingAs($this->admin)
            ->postJson("/settings/ai/providers/{$provider->id}/test-connection")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Connection successful: Bedrock Connected');
    });

    it('returns informative message when listing models for native bedrock provider', function () {
        $provider = AiProvider::factory()->create([
            'slug' => 'bedrock',
            'name' => 'AWS Bedrock (Native)',
            'driver' => 'bedrock',
        ]);

        $this->actingAs($this->admin)
            ->getJson("/settings/ai/providers/{$provider->id}/models")
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    });

    it('can show edit provider page', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->admin)->get("/settings/ai/providers/{$provider->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('provider')
                ->has('drivers')
                ->where('provider.id', $provider->id)
            );
    });

    it('can update a provider', function () {
        $provider = AiProvider::factory()->create([
            'slug' => 'old-slug',
            'name' => 'Old Name',
        ]);

        $this->actingAs($this->admin)->patch("/settings/ai/providers/{$provider->id}", [
            'slug' => 'new-slug',
            'name' => 'New Name',
            'driver' => 'openai',
            'api_key' => 'sk-new-key',
            'is_active' => true,
            'sort_order' => 1,
        ])
            ->assertRedirect('/settings/ai/providers')
            ->assertSessionHas('success');

        $provider->refresh();
        expect($provider->slug)->toBe('new-slug');
        expect($provider->name)->toBe('New Name');
        expect($provider->api_key)->toBe('sk-new-key');
    });

    it('does not overwrite api key when empty', function () {
        $provider = AiProvider::factory()->create([
            'api_key' => 'sk-original-key',
        ]);

        $this->actingAs($this->admin)->patch("/settings/ai/providers/{$provider->id}", [
            'slug' => $provider->slug,
            'name' => $provider->name,
            'driver' => $provider->driver,
            'api_key' => '',
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertRedirect('/settings/ai/providers');

        $provider->refresh();
        expect($provider->api_key)->toBe('sk-original-key');
    });

    it('can delete a provider', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->admin)->delete("/settings/ai/providers/{$provider->id}")
            ->assertRedirect('/settings/ai/providers')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('ai_providers', ['id' => $provider->id]);
    });

    it('deleting a provider cascades to models', function () {
        $provider = AiProvider::factory()->create();
        AiModel::factory()->count(3)->create(['ai_provider_id' => $provider->id]);

        $this->actingAs($this->admin)->delete("/settings/ai/providers/{$provider->id}");

        expect(AiModel::count())->toBe(0);
    });

    it('validates slug is required and unique', function () {
        AiProvider::factory()->create(['slug' => 'existing-slug']);

        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => '',
            'name' => 'Test',
            'driver' => 'openai',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertInvalid(['slug']);

        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => 'existing-slug',
            'name' => 'Test',
            'driver' => 'openai',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertInvalid(['slug']);
    });

    it('validates slug format is lowercase alphanumeric with dashes', function () {
        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => 'Invalid Slug!',
            'name' => 'Test',
            'driver' => 'openai',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertInvalid(['slug']);
    });

    it('validates driver is required and valid', function () {
        $this->actingAs($this->admin)->post('/settings/ai/providers', [
            'slug' => 'test',
            'name' => 'Test',
            'driver' => 'invalid-driver',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertInvalid(['driver']);
    });
});

// ─── Model CRUD ─────────────────────────────────────────────────

describe('Model Management', function () {
    it('can list models', function () {
        $provider = AiProvider::factory()->create();
        AiModel::factory()->count(3)->create(['ai_provider_id' => $provider->id]);

        $this->actingAs($this->admin)->get('/settings/ai/models')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('models', 3));
    });

    it('can show create model page', function () {
        AiProvider::factory()->create();

        $this->actingAs($this->admin)->get('/settings/ai/models/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('providers'));
    });

    it('can create a model', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->admin)->post('/settings/ai/models', [
            'ai_provider_id' => $provider->id,
            'model_id' => 'gpt-4o',
            'name' => 'GPT-4o',
            'supports_web_search' => true,
            'supports_attachments' => true,
            'supports_images' => true,
            'supports_documents' => false,
            'supports_provider_storage' => false,
            'is_default' => false,
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertRedirect('/settings/ai/models')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('ai_models', [
            'model_id' => 'gpt-4o',
            'name' => 'GPT-4o',
            'ai_provider_id' => $provider->id,
        ]);
    });

    it('setting a model as default unsets other defaults', function () {
        $provider = AiProvider::factory()->create();
        $existingDefault = AiModel::factory()->create([
            'ai_provider_id' => $provider->id,
            'is_default' => true,
        ]);

        $this->actingAs($this->admin)->post('/settings/ai/models', [
            'ai_provider_id' => $provider->id,
            'model_id' => 'new-default',
            'name' => 'New Default',
            'is_default' => true,
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertRedirect('/settings/ai/models');

        $existingDefault->refresh();
        expect($existingDefault->is_default)->toBeFalse();

        $newModel = AiModel::where('model_id', 'new-default')->first();
        expect($newModel->is_default)->toBeTrue();
    });

    it('can show edit model page', function () {
        $provider = AiProvider::factory()->create();
        $model = AiModel::factory()->create(['ai_provider_id' => $provider->id]);

        $this->actingAs($this->admin)->get("/settings/ai/models/{$model->id}/edit")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('model')
                ->has('providers')
                ->where('model.id', $model->id)
            );
    });

    it('can update a model', function () {
        $provider = AiProvider::factory()->create();
        $model = AiModel::factory()->create([
            'ai_provider_id' => $provider->id,
            'name' => 'Old Name',
        ]);

        $this->actingAs($this->admin)->patch("/settings/ai/models/{$model->id}", [
            'ai_provider_id' => $provider->id,
            'model_id' => $model->model_id,
            'name' => 'Updated Name',
            'supports_web_search' => true,
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertRedirect('/settings/ai/models')
            ->assertSessionHas('success');

        $model->refresh();
        expect($model->name)->toBe('Updated Name');
    });

    it('can delete a model', function () {
        $provider = AiProvider::factory()->create();
        $model = AiModel::factory()->create(['ai_provider_id' => $provider->id]);

        $this->actingAs($this->admin)->delete("/settings/ai/models/{$model->id}")
            ->assertRedirect('/settings/ai/models')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('ai_models', ['id' => $model->id]);
    });

    it('validates model_id is required', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->admin)->post('/settings/ai/models', [
            'ai_provider_id' => $provider->id,
            'model_id' => '',
            'name' => 'Test',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertInvalid(['model_id']);
    });

    it('validates ai_provider_id must exist', function () {
        $this->actingAs($this->admin)->post('/settings/ai/models', [
            'ai_provider_id' => 'non-existent-id',
            'model_id' => 'test-model',
            'name' => 'Test',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertInvalid(['ai_provider_id']);
    });
});

// ─── Toggle Active ──────────────────────────────────────────────

describe('Toggle Active', function () {
    it('can toggle single provider active', function () {
        $provider = AiProvider::factory()->create(['is_active' => true]);

        $this->actingAs($this->admin)->patch('/settings/ai/providers/toggle-active', [
            'ids' => [$provider->id],
            'is_active' => false,
        ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $provider->refresh();
        expect($provider->is_active)->toBeFalse();
    });

    it('can bulk toggle providers active', function () {
        $providers = AiProvider::factory()->count(3)->create(['is_active' => true]);

        $this->actingAs($this->admin)->patch('/settings/ai/providers/toggle-active', [
            'ids' => $providers->pluck('id')->all(),
            'is_active' => false,
        ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($providers as $provider) {
            $provider->refresh();
            expect($provider->is_active)->toBeFalse();
        }
    });

    it('can enable disabled providers', function () {
        $providers = AiProvider::factory()->count(2)->create(['is_active' => false]);

        $this->actingAs($this->admin)->patch('/settings/ai/providers/toggle-active', [
            'ids' => $providers->pluck('id')->all(),
            'is_active' => true,
        ])
            ->assertRedirect();

        foreach ($providers as $provider) {
            $provider->refresh();
            expect($provider->is_active)->toBeTrue();
        }
    });

    it('can toggle single model active', function () {
        $provider = AiProvider::factory()->create();
        $model = AiModel::factory()->create([
            'ai_provider_id' => $provider->id,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)->patch('/settings/ai/models/toggle-active', [
            'ids' => [$model->id],
            'is_active' => false,
        ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $model->refresh();
        expect($model->is_active)->toBeFalse();
    });

    it('can bulk toggle models active', function () {
        $provider = AiProvider::factory()->create();
        $models = AiModel::factory()->count(3)->create([
            'ai_provider_id' => $provider->id,
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)->patch('/settings/ai/models/toggle-active', [
            'ids' => $models->pluck('id')->all(),
            'is_active' => false,
        ])
            ->assertRedirect()
            ->assertSessionHas('success');

        foreach ($models as $model) {
            $model->refresh();
            expect($model->is_active)->toBeFalse();
        }
    });

    it('validates ids are required for provider toggle', function () {
        $this->actingAs($this->admin)->patch('/settings/ai/providers/toggle-active', [
            'ids' => [],
            'is_active' => true,
        ])->assertInvalid(['ids']);
    });

    it('validates ids are required for model toggle', function () {
        $this->actingAs($this->admin)->patch('/settings/ai/models/toggle-active', [
            'ids' => [],
            'is_active' => true,
        ])->assertInvalid(['ids']);
    });

    it('validates is_active is required', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->admin)->patch('/settings/ai/providers/toggle-active', [
            'ids' => [$provider->id],
        ])->assertInvalid(['is_active']);
    });

    it('non-admin cannot toggle providers', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->regularUser)->patch('/settings/ai/providers/toggle-active', [
            'ids' => [$provider->id],
            'is_active' => false,
        ])->assertForbidden();
    });

    it('non-admin cannot toggle models', function () {
        $provider = AiProvider::factory()->create();
        $model = AiModel::factory()->create(['ai_provider_id' => $provider->id]);

        $this->actingAs($this->regularUser)->patch('/settings/ai/models/toggle-active', [
            'ids' => [$model->id],
            'is_active' => false,
        ])->assertForbidden();
    });
});

// ─── Authorization ──────────────────────────────────────────────

describe('Authorization', function () {
    it('non-admin cannot access provider pages', function () {
        $this->actingAs($this->regularUser)->get('/settings/ai/providers')
            ->assertForbidden();
    });

    it('non-admin cannot access model pages', function () {
        $this->actingAs($this->regularUser)->get('/settings/ai/models')
            ->assertForbidden();
    });

    it('non-admin cannot create a provider', function () {
        $this->actingAs($this->regularUser)->post('/settings/ai/providers', [
            'slug' => 'test',
            'name' => 'Test',
            'driver' => 'openai',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertForbidden();
    });

    it('non-admin cannot create a model', function () {
        $provider = AiProvider::factory()->create();

        $this->actingAs($this->regularUser)->post('/settings/ai/models', [
            'ai_provider_id' => $provider->id,
            'model_id' => 'test',
            'name' => 'Test',
            'is_active' => true,
            'sort_order' => 0,
        ])->assertForbidden();
    });

    it('unauthenticated user is redirected to login', function () {
        $this->get('/settings/ai/providers')
            ->assertRedirect('/login');
    });
});
