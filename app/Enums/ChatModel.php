<?php

namespace App\Enums;

enum ChatModel: string
{
    case Gpt4o = 'gpt-4o';
    case Gpt5Mini = 'gpt-5-mini';
    case Gpt52 = 'gpt-5.2';
    case BedrockSonnet45 = 'global.anthropic.claude-sonnet-4-5-20250929-v1:0';
    case BedrockOpus45 = 'global.anthropic.claude-opus-4-5-20251101-v1:0';
    case BifrostSonnet4 = 'bedrock/global.anthropic.claude-sonnet-4-6';
    case BifrostOpus4 = 'bedrock/global.anthropic.claude-opus-4-6-v1';
    case LitellmSonnet = 'claude-sonnet';
    case LitellmOpus = 'claude-opus';

    public function label(): string
    {
        return match ($this) {
            self::Gpt4o => 'GPT-4o',
            self::Gpt5Mini => 'GPT-5 Mini',
            self::Gpt52 => 'GPT-5.2',
            self::BedrockSonnet45 => 'Claude Sonnet 4.5 (BAG)',
            self::BedrockOpus45 => 'Claude Opus 4.5 (BAG)',
            self::BifrostSonnet4 => 'Claude Sonnet 4',
            self::BifrostOpus4 => 'Claude Opus 4',
            self::LitellmSonnet => 'Claude Sonnet',
            self::LitellmOpus => 'Claude Opus',
        };
    }

    public function provider(): string
    {
        return match ($this) {
            self::Gpt4o, self::Gpt5Mini, self::Gpt52 => 'openai',
            self::BedrockSonnet45, self::BedrockOpus45 => 'bedrock-access-gateway',
            self::BifrostSonnet4, self::BifrostOpus4 => 'bifrost',
            self::LitellmSonnet, self::LitellmOpus => 'litellm',
        };
    }

    public function providerLabel(): string
    {
        return match ($this->provider()) {
            'openai' => 'OpenAI',
            'bedrock-access-gateway' => 'AWS Bedrock (BAG)',
            'bifrost' => 'AWS Bedrock (Bifrost)',
            'litellm' => 'LiteLLM',
            default => ucfirst($this->provider()),
        };
    }

    public function supportsWebSearch(): bool
    {
        return match ($this) {
            self::Gpt4o, self::BedrockSonnet45, self::BedrockOpus45,
            self::BifrostSonnet4, self::BifrostOpus4,
            self::LitellmSonnet, self::LitellmOpus => false,
            self::Gpt5Mini, self::Gpt52 => true,
        };
    }

    public function supportsAttachments(): bool
    {
        return match ($this) {
            self::Gpt4o, self::Gpt5Mini, self::Gpt52,
            self::BedrockSonnet45, self::BedrockOpus45,
            self::BifrostSonnet4, self::BifrostOpus4,
            self::LitellmSonnet, self::LitellmOpus => true,
        };
    }

    public function supportsImages(): bool
    {
        return $this->supportsAttachments();
    }

    public function supportsDocuments(): bool
    {
        return $this->supportsAttachments();
    }

    public function supportsProviderStorage(): bool
    {
        return match ($this->provider()) {
            'openai' => true,
            default => false,
        };
    }

    public static function default(): self
    {
        return self::Gpt52;
    }

    /**
     * @return array<int, array{provider: string, provider_label: string, models: array<int, array{value: string, label: string, supports_web_search: bool, supports_attachments: bool, supports_images: bool, supports_documents: bool}>}>
     */
    public static function groupedOptions(): array
    {
        $groups = [];

        foreach (self::cases() as $model) {
            $provider = $model->provider();

            if (! array_key_exists($provider, $groups)) {
                $groups[$provider] = [
                    'provider' => $provider,
                    'provider_label' => $model->providerLabel(),
                    'models' => [],
                ];
            }

            $groups[$provider]['models'][] = [
                'value' => $model->value,
                'label' => $model->label(),
                'supports_web_search' => $model->supportsWebSearch(),
                'supports_attachments' => $model->supportsAttachments(),
                'supports_images' => $model->supportsImages(),
                'supports_documents' => $model->supportsDocuments(),
            ];
        }

        return array_values($groups);
    }
}
