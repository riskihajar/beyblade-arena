<?php

use App\Agents\ChatTitleAgent;
use App\Enums\ChatModel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

test('chat index renders empty state props for authenticated user', function () {
    /** @var User $user */
    $user = User::factory()->createOne();

    actingAs($user)
        ->get(route('chat.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('chat/index')
            ->has('conversations', 0)
            ->where('active_chat', null)
            ->where('messages', [])
            ->has('model_groups')
            ->where('default_model', ChatModel::default()->value)
        );
});

test('creating a chat stores default model and provider', function () {
    /** @var User $user */
    $user = User::factory()->createOne();

    actingAs($user)->post(route('chat.store'))->assertRedirect();

    assertDatabaseHas('chats', [
        'user_id' => $user->id,
        'provider' => ChatModel::default()->provider(),
        'model' => ChatModel::default()->value,
    ]);
});

test('creating a chat reuses draft conversation when it has no messages', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $draftId = Str::ulid()->toString();

    DB::table('chats')->insert([
        'id' => $draftId,
        'user_id' => $user->id,
        'title' => 'Project Draft',
        'is_title_generated' => false,
        'provider' => ChatModel::default()->provider(),
        'model' => ChatModel::default()->value,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    actingAs($user)->post(route('chat.store'))->assertRedirect(route('chat.show', ['chat' => $draftId]));

    expect(DB::table('chats')->where('user_id', $user->id)->count())->toBe(1);
});

test('creating a chat reuses existing new chat conversation', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $draftId = Str::ulid()->toString();

    DB::table('chats')->insert([
        'id' => $draftId,
        'user_id' => $user->id,
        'title' => 'New Chat',
        'is_title_generated' => false,
        'provider' => ChatModel::default()->provider(),
        'model' => ChatModel::default()->value,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('chat_messages')->insert([
        'id' => Str::ulid()->toString(),
        'conversation_id' => $draftId,
        'user_id' => $user->id,
        'agent' => 'App\\Agents\\ChatAgent',
        'role' => 'user',
        'content' => 'Hi there',
        'attachments' => '[]',
        'tool_calls' => '[]',
        'tool_results' => '[]',
        'usage' => '[]',
        'meta' => '[]',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $targetModel = ChatModel::Gpt52;

    actingAs($user)
        ->post(route('chat.store'), ['model' => $targetModel->value])
        ->assertRedirect(route('chat.show', ['chat' => $draftId]));

    expect(DB::table('chats')->where('user_id', $user->id)->count())->toBe(1);

    assertDatabaseHas('chats', [
        'id' => $draftId,
        'provider' => $targetModel->provider(),
        'model' => $targetModel->value,
    ]);
});

test('manual title update marks conversation as generated', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $chatId = Str::ulid()->toString();

    DB::table('chats')->insert([
        'id' => $chatId,
        'user_id' => $user->id,
        'title' => 'New Chat',
        'is_title_generated' => false,
        'provider' => null,
        'model' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    actingAs($user)
        ->from(route('chat.show', ['chat' => $chatId]))
        ->patch(route('chat.update', ['chat' => $chatId]), [
            'title' => 'Project kickoff notes',
        ])
        ->assertRedirect(route('chat.show', ['chat' => $chatId]));

    assertDatabaseHas('chats', [
        'id' => $chatId,
        'title' => 'Project kickoff notes',
        'is_title_generated' => true,
    ]);
});

test('title stream generates and persists an ai title', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $chatId = Str::ulid()->toString();

    DB::table('chats')->insert([
        'id' => $chatId,
        'user_id' => $user->id,
        'title' => 'Halo, saya mau tanya tentang desain API',
        'is_title_generated' => false,
        'provider' => null,
        'model' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('chat_messages')->insert([
        'id' => Str::ulid()->toString(),
        'conversation_id' => $chatId,
        'user_id' => $user->id,
        'agent' => 'App\\Agents\\ChatAgent',
        'role' => 'user',
        'content' => 'Halo, saya mau tanya tentang desain API',
        'attachments' => '[]',
        'tool_calls' => '[]',
        'tool_results' => '[]',
        'usage' => '[]',
        'meta' => '[]',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    ChatTitleAgent::fake(['Desain API untuk Chat']);

    $response = actingAs($user)
        ->get(route('chat.title-stream', ['chat' => $chatId]));

    $response->assertOk()->assertStreamed();

    $content = $response->streamedContent();

    expect($content)->toContain('event: title-update');
    expect($content)->toContain('Desain API untuk Chat');
    expect($content)->toContain('</stream>');

    assertDatabaseHas('chats', [
        'id' => $chatId,
        'title' => 'Desain API untuk Chat',
        'is_title_generated' => true,
    ]);
});

test('chat conversations endpoint returns paginated user chats only', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    /** @var User $otherUser */
    $otherUser = User::factory()->createOne();

    for ($index = 1; $index <= 12; $index++) {
        DB::table('chats')->insert([
            'id' => Str::ulid()->toString(),
            'user_id' => $user->id,
            'title' => "Chat {$index}",
            'is_title_generated' => true,
            'provider' => null,
            'model' => null,
            'created_at' => now()->subMinutes($index),
            'updated_at' => now()->subMinutes($index),
        ]);
    }

    $otherChatIds = [];

    for ($index = 1; $index <= 3; $index++) {
        $chatId = Str::ulid()->toString();
        $otherChatIds[] = $chatId;

        DB::table('chats')->insert([
            'id' => $chatId,
            'user_id' => $otherUser->id,
            'title' => "Other Chat {$index}",
            'is_title_generated' => true,
            'provider' => null,
            'model' => null,
            'created_at' => now()->subMinutes($index),
            'updated_at' => now()->subMinutes($index),
        ]);
    }

    $response = actingAs($user)->getJson(route('chat.conversations', [
        'page' => 2,
        'per_page' => 5,
    ]));

    $response
        ->assertOk()
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.total', 12)
        ->assertJsonCount(5, 'data');

    $returnedIds = collect($response->json('data'))->pluck('id')->all();

    expect(array_intersect($returnedIds, $otherChatIds))->toBe([]);
});

test('chat model update endpoint updates model and provider', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $chatId = Str::ulid()->toString();

    DB::table('chats')->insert([
        'id' => $chatId,
        'user_id' => $user->id,
        'title' => 'New Chat',
        'is_title_generated' => false,
        'provider' => ChatModel::default()->provider(),
        'model' => ChatModel::default()->value,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $targetModel = ChatModel::Gpt52;

    actingAs($user)
        ->from(route('chat.show', ['chat' => $chatId]))
        ->patch(route('chat.update-model', ['chat' => $chatId]), [
            'model' => $targetModel->value,
        ])
        ->assertRedirect(route('chat.show', ['chat' => $chatId]));

    assertDatabaseHas('chats', [
        'id' => $chatId,
        'provider' => $targetModel->provider(),
        'model' => $targetModel->value,
    ]);
});

test('destroying a conversation redirects with success flash message', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $chatId = Str::ulid()->toString();

    DB::table('chats')->insert([
        'id' => $chatId,
        'user_id' => $user->id,
        'title' => 'Draft chat',
        'is_title_generated' => false,
        'provider' => ChatModel::default()->provider(),
        'model' => ChatModel::default()->value,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('chat_messages')->insert([
        'id' => Str::ulid()->toString(),
        'conversation_id' => $chatId,
        'user_id' => $user->id,
        'agent' => 'App\\Agents\\ChatAgent',
        'role' => 'user',
        'content' => 'Hello',
        'attachments' => '[]',
        'tool_calls' => '[]',
        'tool_results' => '[]',
        'usage' => '[]',
        'meta' => '[]',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    actingAs($user)
        ->delete(route('chat.destroy', ['chat' => $chatId]))
        ->assertRedirect(route('chat.index'))
        ->assertSessionHas('success', 'Conversation deleted.');

    expect(DB::table('chats')->where('id', $chatId)->exists())->toBeFalse();
    expect(DB::table('chat_messages')->where('conversation_id', $chatId)->exists())->toBeFalse();
});
