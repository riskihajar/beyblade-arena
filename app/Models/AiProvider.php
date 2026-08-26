<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiProvider extends Model
{
    use HasFactory, HasUlids;

    protected $hidden = ['api_key'];

    protected $fillable = [
        'slug',
        'name',
        'driver',
        'base_url',
        'api_key',
        'extra_config',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
            'extra_config' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return HasMany<AiModel, $this>
     */
    public function models(): HasMany
    {
        return $this->hasMany(AiModel::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<AiModel, $this>
     */
    public function activeModels(): HasMany
    {
        return $this->models()->where('is_active', true);
    }

    /**
     * Scope: only active providers.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Build the provider config array for Prism/AI SDK registration.
     *
     * @return array<string, mixed>
     */
    public function toPrismConfig(): array
    {
        $config = [
            'driver' => $this->driver,
            'key' => $this->api_key ?? '',
        ];

        if ($this->base_url) {
            $config['url'] = $this->base_url;
        }

        if (is_array($this->extra_config)) {
            $config = array_merge($config, $this->extra_config);
        }

        return $config;
    }
}
