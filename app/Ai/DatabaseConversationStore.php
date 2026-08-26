<?php

namespace App\Ai;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\ConversationStore;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Prompts\AgentPrompt;
use Laravel\Ai\Responses\AgentResponse;

class DatabaseConversationStore implements ConversationStore
{
    protected static ?array $pendingAttachments = null;

    public static function setPendingAttachments(?array $attachments): void
    {
        static::$pendingAttachments = $attachments;
    }

    public function latestConversationId(string|int $userId): ?string
    {
        return DB::table('chats')
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->first()?->id;
    }

    public function storeConversation(string|int|null $userId, string $title): string
    {
        $conversationId = Str::ulid()->toString();

        DB::table('chats')->insert([
            'id' => $conversationId,
            'user_id' => $userId,
            'title' => $title,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $conversationId;
    }

    public function storeUserMessage(string $conversationId, string|int|null $userId, AgentPrompt $prompt): string
    {
        $messageId = Str::ulid()->toString();

        $attachmentsData = static::$pendingAttachments ?? $this->serializeProviderAttachments($prompt->attachments);
        static::$pendingAttachments = null;

        DB::table('chat_messages')->insert([
            'id' => $messageId,
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'agent' => $prompt->agent::class,
            'role' => 'user',
            'content' => $prompt->prompt,
            'attachments' => json_encode($attachmentsData),
            'tool_calls' => '[]',
            'tool_results' => '[]',
            'usage' => '[]',
            'meta' => '[]',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('chats')
            ->where('id', $conversationId)
            ->update(['updated_at' => now()]);

        return $messageId;
    }

    public function storeAssistantMessage(string $conversationId, string|int|null $userId, AgentPrompt $prompt, AgentResponse $response): string
    {
        $messageId = Str::ulid()->toString();

        DB::table('chat_messages')->insert([
            'id' => $messageId,
            'conversation_id' => $conversationId,
            'user_id' => $userId,
            'agent' => $prompt->agent::class,
            'role' => 'assistant',
            'content' => $response->text,
            'attachments' => '[]',
            'tool_calls' => json_encode($response->toolCalls),
            'tool_results' => json_encode($response->toolResults),
            'usage' => json_encode($response->usage),
            'meta' => json_encode($response->meta),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('chats')
            ->where('id', $conversationId)
            ->update(['updated_at' => now()]);

        return $messageId;
    }

    public function getLatestConversationMessages(string $conversationId, int $limit): Collection
    {
        return DB::table('chat_messages')
            ->where('conversation_id', $conversationId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($m) => new Message($m->role, $m->content));
    }

    protected function serializeProviderAttachments(Collection $attachments): array
    {
        return $attachments->map(function ($attachment) {
            if ($attachment instanceof Document || $attachment instanceof Image) {
                return [
                    'type' => $attachment instanceof Image ? 'image' : 'document',
                    'provider_file_id' => method_exists($attachment, 'getId') ? $attachment->getId() : null,
                ];
            }

            return null;
        })->filter()->values()->all();
    }
}
