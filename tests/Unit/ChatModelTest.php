<?php

use App\Enums\ChatModel;

test('gpt-4o does not support web search', function () {
    expect(ChatModel::Gpt4o->supportsWebSearch())->toBeFalse();
});

test('gpt-5-mini supports web search', function () {
    expect(ChatModel::Gpt5Mini->supportsWebSearch())->toBeTrue();
});

test('gpt-5.2 supports web search', function () {
    expect(ChatModel::Gpt52->supportsWebSearch())->toBeTrue();
});

test('bedrock models do not support web search', function () {
    expect(ChatModel::BedrockSonnet45->supportsWebSearch())->toBeFalse();
    expect(ChatModel::BedrockOpus45->supportsWebSearch())->toBeFalse();
});

test('bifrost models do not support web search', function () {
    expect(ChatModel::BifrostSonnet4->supportsWebSearch())->toBeFalse();
    expect(ChatModel::BifrostOpus4->supportsWebSearch())->toBeFalse();
});

test('all models support attachments', function () {
    foreach (ChatModel::cases() as $model) {
        expect($model->supportsAttachments())->toBeTrue();
    }
});

test('all models support images', function () {
    foreach (ChatModel::cases() as $model) {
        expect($model->supportsImages())->toBeTrue();
    }
});

test('all models support documents', function () {
    foreach (ChatModel::cases() as $model) {
        expect($model->supportsDocuments())->toBeTrue();
    }
});

test('openai models support provider storage', function () {
    expect(ChatModel::Gpt4o->supportsProviderStorage())->toBeTrue();
    expect(ChatModel::Gpt5Mini->supportsProviderStorage())->toBeTrue();
    expect(ChatModel::Gpt52->supportsProviderStorage())->toBeTrue();
});

test('bedrock models do not support provider storage', function () {
    expect(ChatModel::BedrockSonnet45->supportsProviderStorage())->toBeFalse();
    expect(ChatModel::BedrockOpus45->supportsProviderStorage())->toBeFalse();
});

test('bifrost models do not support provider storage', function () {
    expect(ChatModel::BifrostSonnet4->supportsProviderStorage())->toBeFalse();
    expect(ChatModel::BifrostOpus4->supportsProviderStorage())->toBeFalse();
});

test('bedrock models return bedrock-access-gateway as provider', function () {
    expect(ChatModel::BedrockSonnet45->provider())->toBe('bedrock-access-gateway');
    expect(ChatModel::BedrockOpus45->provider())->toBe('bedrock-access-gateway');
});

test('bifrost models return bifrost as provider', function () {
    expect(ChatModel::BifrostSonnet4->provider())->toBe('bifrost');
    expect(ChatModel::BifrostOpus4->provider())->toBe('bifrost');
});

test('bedrock models return AWS Bedrock (BAG) as provider label', function () {
    expect(ChatModel::BedrockSonnet45->providerLabel())->toBe('AWS Bedrock (BAG)');
    expect(ChatModel::BedrockOpus45->providerLabel())->toBe('AWS Bedrock (BAG)');
});

test('bifrost models return AWS Bedrock (Bifrost) as provider label', function () {
    expect(ChatModel::BifrostSonnet4->providerLabel())->toBe('AWS Bedrock (Bifrost)');
    expect(ChatModel::BifrostOpus4->providerLabel())->toBe('AWS Bedrock (Bifrost)');
});

test('grouped options includes supports_web_search for each model', function () {
    $groups = ChatModel::groupedOptions();

    foreach ($groups as $group) {
        foreach ($group['models'] as $model) {
            expect($model)->toHaveKey('supports_web_search');
            expect($model['supports_web_search'])->toBeBool();
        }
    }
});

test('grouped options includes attachment support fields for each model', function () {
    $groups = ChatModel::groupedOptions();

    foreach ($groups as $group) {
        foreach ($group['models'] as $model) {
            expect($model)->toHaveKey('supports_attachments');
            expect($model)->toHaveKey('supports_images');
            expect($model)->toHaveKey('supports_documents');
            expect($model['supports_attachments'])->toBeBool();
            expect($model['supports_images'])->toBeBool();
            expect($model['supports_documents'])->toBeBool();
        }
    }
});

test('grouped options groups bedrock models under bedrock-access-gateway provider', function () {
    $groups = ChatModel::groupedOptions();
    $bedrockGroup = collect($groups)->firstWhere('provider', 'bedrock-access-gateway');

    expect($bedrockGroup)->not->toBeNull();
    expect($bedrockGroup['provider_label'])->toBe('AWS Bedrock (BAG)');
    expect($bedrockGroup['models'])->toHaveCount(2);
});

test('grouped options groups bifrost models under bifrost provider', function () {
    $groups = ChatModel::groupedOptions();
    $bifrostGroup = collect($groups)->firstWhere('provider', 'bifrost');

    expect($bifrostGroup)->not->toBeNull();
    expect($bifrostGroup['provider_label'])->toBe('AWS Bedrock (Bifrost)');
    expect($bifrostGroup['models'])->toHaveCount(2);
});

test('litellm models do not support web search', function () {
    expect(ChatModel::LitellmSonnet->supportsWebSearch())->toBeFalse();
    expect(ChatModel::LitellmOpus->supportsWebSearch())->toBeFalse();
});

test('litellm models do not support provider storage', function () {
    expect(ChatModel::LitellmSonnet->supportsProviderStorage())->toBeFalse();
    expect(ChatModel::LitellmOpus->supportsProviderStorage())->toBeFalse();
});

test('litellm models return litellm as provider', function () {
    expect(ChatModel::LitellmSonnet->provider())->toBe('litellm');
    expect(ChatModel::LitellmOpus->provider())->toBe('litellm');
});

test('litellm models return LiteLLM as provider label', function () {
    expect(ChatModel::LitellmSonnet->providerLabel())->toBe('LiteLLM');
    expect(ChatModel::LitellmOpus->providerLabel())->toBe('LiteLLM');
});

test('grouped options groups litellm models under litellm provider', function () {
    $groups = ChatModel::groupedOptions();
    $litellmGroup = collect($groups)->firstWhere('provider', 'litellm');

    expect($litellmGroup)->not->toBeNull();
    expect($litellmGroup['provider_label'])->toBe('LiteLLM');
    expect($litellmGroup['models'])->toHaveCount(2);
});
