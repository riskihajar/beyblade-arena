<?php

use App\Agents\ChatAgent;
use App\Ai\Tools\DatabaseQueryTool;
use App\Ai\Tools\DatabaseSchemaTool;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Providers\Tools\WebSearch;

use function Pest\Laravel\assertDatabaseHas;

test('chat agent implements conversational contract', function () {
    expect(ChatAgent::make())->toBeInstanceOf(Conversational::class);
});

test('chat agent implements has tools contract', function () {
    expect(ChatAgent::make())->toBeInstanceOf(HasTools::class);
});

test('chat agent can prompt and get response', function () {
    ChatAgent::fake(['Test successful']);

    $agent = ChatAgent::make();
    $response = $agent->prompt('Say "Test successful" exactly.');

    expect($response->text)->toBe('Test successful');
});

test('chat agent with user stores conversation in database', function () {
    ChatAgent::fake(['Hello back']);

    $user = User::factory()->create();

    $agent = ChatAgent::make();
    $response = $agent->forUser($user)->prompt('Hello, say "Hello back"');

    expect($response->text)->toBeString();

    $conversationId = $response->conversationId;

    expect($conversationId)->not->toBeNull();

    assertDatabaseHas('chats', [
        'user_id' => $user->id,
    ]);

    assertDatabaseHas('chat_messages', [
        'conversation_id' => $conversationId,
        'role' => 'user',
    ]);

    assertDatabaseHas('chat_messages', [
        'conversation_id' => $conversationId,
        'role' => 'assistant',
    ]);
});

test('chat agent continues conversation with history', function () {
    ChatAgent::fake([
        'Nice to meet you, TestUser!',
        'Your name is TestUser.',
    ]);

    $user = User::factory()->create();

    $agent = ChatAgent::make();
    $agent->forUser($user)->prompt('Hello, my name is TestUser.');

    $agent = ChatAgent::make();
    $response = $agent->continueLastConversation($user)->prompt('What is my name?');

    $conversationId = $response->conversationId;

    expect($conversationId)->not->toBeNull();

    $messages = DB::table('chat_messages')
        ->where('conversation_id', $conversationId)
        ->orderBy('created_at')
        ->get();

    expect($messages)->toHaveCount(4);
    expect($messages[0]->role)->toBe('user');
    expect($messages[0]->content)->toContain('Hello, my name is TestUser');
    expect($messages[1]->role)->toBe('assistant');
    expect($messages[2]->role)->toBe('user');
    expect($messages[2]->content)->toContain('What is my name');
    expect($messages[3]->role)->toBe('assistant');
});

test('chat agent always includes database tools', function () {
    $agent = ChatAgent::make();

    $tools = iterator_to_array($agent->tools());

    expect(count($tools))->toBeGreaterThanOrEqual(2);
    expect($tools[0])->toBeInstanceOf(DatabaseSchemaTool::class);
    expect($tools[1])->toBeInstanceOf(DatabaseQueryTool::class);
});

test('chat agent with web search enabled includes WebSearch tool', function () {
    $agent = ChatAgent::make()->withWebSearch(true);

    $tools = iterator_to_array($agent->tools());

    expect(count($tools))->toBeGreaterThanOrEqual(3);
    expect(end($tools))->toBeInstanceOf(WebSearch::class);
});

test('chat agent with web search disabled excludes WebSearch tool', function () {
    $agent = ChatAgent::make()->withWebSearch(false);

    $tools = iterator_to_array($agent->tools());

    expect(count($tools))->toBeGreaterThanOrEqual(2);
    expect($tools[0])->toBeInstanceOf(DatabaseSchemaTool::class);
    expect($tools[1])->toBeInstanceOf(DatabaseQueryTool::class);

    $toolClasses = array_map(fn ($t) => get_class($t), $tools);
    expect($toolClasses)->not->toContain(WebSearch::class);
});
