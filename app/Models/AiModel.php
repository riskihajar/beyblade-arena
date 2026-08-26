<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiModel extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'ai_provider_id',
        'model_id',
        'name',
        'supports_web_search',
        'supports_attachments',
        'supports_images',
        'supports_documents',
        'supports_provider_storage',
        'is_default',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'supports_web_search' => 'boolean',
            'supports_attachments' => 'boolean',
            'supports_images' => 'boolean',
            'supports_documents' => 'boolean',
            'supports_provider_storage' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<AiProvider, $this>
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(AiProvider::class, 'ai_provider_id');
    }

    /**
     * Scope: only active models with active providers.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->whereHas('provider', fn ($q) => $q->where('is_active', true));
    }

    /**
     * Scope: filter by provider slug.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeByProvider(Builder $query, string $providerSlug): Builder
    {
        return $query->whereHas('provider', fn ($q) => $q->where('slug', $providerSlug));
    }

    /**
     * Find the default model, or the first active model.
     */
    public static function defaultModel(): ?static
    {
        return static::active()
            ->where('is_default', true)
            ->first()
            ?? static::active()->orderBy('sort_order')->first();
    }

    /**
     * Find a model by its model_id string.
     */
    public static function findByModelId(string $modelId): ?static
    {
        return static::where('model_id', $modelId)->first();
    }

    /**
     * Get grouped options for the chat interface dropdown.
     *
     * @return array<int, array{provider: string, provider_label: string, models: array<int, array{value: string, label: string, supports_web_search: bool, supports_attachments: bool, supports_images: bool, supports_documents: bool}>}>
     */
    public static function groupedOptions(): array
    {
        $models = static::active()
            ->with('provider')
            ->orderBy('sort_order')
            ->get();

        $groups = [];

        foreach ($models as $model) {
            $providerSlug = $model->provider->slug;

            if (! array_key_exists($providerSlug, $groups)) {
                $groups[$providerSlug] = [
                    'provider' => $providerSlug,
                    'provider_label' => $model->provider->name,
                    'models' => [],
                ];
            }

            $groups[$providerSlug]['models'][] = [
                'value' => $model->model_id,
                'label' => $model->name,
                'supports_web_search' => $model->supports_web_search,
                'supports_attachments' => $model->supports_attachments,
                'supports_images' => $model->supports_images,
                'supports_documents' => $model->supports_documents,
            ];
        }

        return array_values($groups);
    }
}
