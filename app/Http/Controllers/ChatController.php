<?php

namespace App\Http\Controllers;

use App\Agents\ChatAgent;
use App\Agents\ChatTitleAgent;
use App\Ai\AiProviderRegistry;
use App\Ai\ChatAttachment;
use App\Ai\ChatAttachmentService;
use App\Ai\DatabaseConversationStore;
use App\Enums\ChatModel;
use App\Models\Chat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
        ]);

        $user = $request->user();
        $perPage = (int) ($validated['per_page'] ?? 10);

        $conversations = DB::table('chats')
            ->where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        $conversations->setCollection(
            $conversations->getCollection()->map(fn ($chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'updated_at' => $chat->updated_at,
            ])
        );

        return response()->json([
            'data' => $conversations->items(),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'from' => $conversations->firstItem(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'to' => $conversations->lastItem(),
                'total' => $conversations->total(),
            ],
        ]);
    }

    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        $conversations = $this->getConversations($user->id);

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
            'active_chat' => null,
            'messages' => [],
            'model_groups' => $this->availableModelGroups(),
            'default_model' => AiProviderRegistry::defaultModelId(),
        ]);
    }

    public function show(Request $request, Chat $chat): InertiaResponse
    {
        $user = $request->user();

        $activeChat = $this->findConversationForUser($chat->id, $user->id);

        if (! $activeChat) {
            abort(404, 'Conversation not found');
        }

        $messages = $this->getMessages($activeChat->id);
        $conversations = $this->getConversations($user->id);

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
            'active_chat' => $activeChat,
            'messages' => $messages,
            'model_groups' => $this->availableModelGroups(),
            'default_model' => AiProviderRegistry::defaultModelId(),
        ]);
    }

    public function stream(Request $request, Chat $chat): Response
    {
        AiProviderRegistry::registerProviders();

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:20000'],
            'model' => ['nullable', 'string', Rule::in(AiProviderRegistry::validModelIds())],
            'web_search' => ['nullable', 'boolean'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*.id' => ['required', 'string'],
            'attachments.*.type' => ['required', 'string', 'in:image,document'],
            'attachments.*.name' => ['required', 'string'],
            'attachments.*.mime_type' => ['required', 'string'],
            'attachments.*.size' => ['required', 'integer'],
            'attachments.*.storage_driver' => ['required', 'string'],
            'attachments.*.provider_file_id' => ['nullable', 'string'],
            'attachments.*.storage_path' => ['nullable', 'string'],
            'attachments.*.url' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $message = trim($validated['message']);

        if ($message === '') {
            return response()->json(['error' => 'Message is required.'], 422);
        }

        $conversation = $this->findConversationForUser($chat->id, $user->id);

        if (! $conversation) {
            abort(404, 'Conversation not found');
        }

        $resolved = $this->resolveConversationModel($conversation);

        if (isset($validated['model'])) {
            $resolved = $this->resolveModelFromId($validated['model']);
            $this->persistConversationModel($conversation->id, $user->id, $resolved['provider'], $resolved['model_id']);
        }

        $this->setDefaultTitleFromFirstMessage($conversation, $message);

        try {
            $provider = $resolved['provider'];
            $model = $resolved['model_id'];
            $enableWebSearch = (bool) ($validated['web_search'] ?? false)
                && ($resolved['supports_web_search'] ?? false);

            $attachments = $this->resolveAttachments(
                $validated['attachments'] ?? [],
                $provider,
            );

            if (! empty($validated['attachments'])) {
                DatabaseConversationStore::setPendingAttachments($validated['attachments']);
            }

            $stream = (new ChatAgent)
                ->withWebSearch($enableWebSearch)
                ->continue($chat->id, $user)
                ->stream($message, attachments: $attachments, provider: $provider, model: $model);

            return response()->stream(function () use ($stream): void {
                @ini_set('max_execution_time', '120');
                @ini_set('output_buffering', 'off');
                @ini_set('zlib.output_compression', '0');

                foreach ($stream as $event) {
                    echo 'data: '.((string) $event)."\n\n";

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }

                    flush();
                }

                echo "data: [DONE]\n\n";

                if (ob_get_level() > 0) {
                    ob_flush();
                }

                flush();
            }, 200, [
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Connection' => 'keep-alive',
                'Content-Type' => 'text/event-stream',
                'Pragma' => 'no-cache',
                'X-Accel-Buffering' => 'no',
            ]);
        } catch (\Throwable $e) {
            Log::error('Chat stream error: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'error' => 'Something went wrong while generating the response. Please try again.',
            ], 500);
        }
    }

    public function upload(Request $request, Chat $chat): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:20480'],
            'model' => ['nullable', 'string', Rule::in(AiProviderRegistry::validModelIds())],
        ]);

        $user = $request->user();
        $conversation = $this->findConversationForUser($chat->id, $user->id);

        if (! $conversation) {
            abort(404, 'Conversation not found');
        }

        $resolved = isset($validated['model'])
            ? $this->resolveModelFromId($validated['model'])
            : $this->resolveConversationModel($conversation);

        if (! ($resolved['supports_attachments'] ?? true)) {
            return response()->json([
                'error' => 'This model does not support file attachments.',
            ], 422);
        }

        $file = $validated['file'];
        $mimeType = $file->getMimeType() ?? 'application/octet-stream';

        $allowedImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $allowedDocMimes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];

        if (! in_array($mimeType, [...$allowedImageMimes, ...$allowedDocMimes])) {
            return response()->json([
                'error' => 'File type not supported. Allowed: images (JPEG, PNG, GIF, WebP) and documents (PDF, TXT, MD, CSV).',
            ], 422);
        }

        try {
            $attachmentService = app(ChatAttachmentService::class);
            $attachment = $attachmentService->store($file, $resolved, $user->id);

            return response()->json([
                'attachment' => $attachment->toArray(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Chat attachment upload error: '.$e->getMessage());

            return response()->json(['error' => 'Failed to upload file.'], 500);
        }
    }

    public function titleStream(Request $request, Chat $chat): StreamedResponse
    {
        AiProviderRegistry::registerProviders();

        $user = $request->user();

        $conversation = $this->findConversationForUser($chat->id, $user->id);

        if (! $conversation) {
            abort(404, 'Conversation not found');
        }

        return response()->stream(function () use ($chat, $user, $conversation): void {
            $emit = function (string $event, string $data): void {
                echo "event: {$event}\n";
                echo "data: {$data}\n\n";

                if (ob_get_level() > 0) {
                    ob_flush();
                }

                flush();
            };

            if ((bool) ($conversation->is_title_generated ?? false) && filled($conversation->title)) {
                $existingTitle = json_encode(['title' => $conversation->title]) ?: '{}';
                $emit('title-update', $existingTitle);
                $emit('title-update', '</stream>');

                return;
            }

            $firstUserMessage = DB::table('chat_messages')
                ->where('conversation_id', $chat->id)
                ->where('role', 'user')
                ->orderBy('created_at')
                ->value('content');

            if (! is_string($firstUserMessage) || trim($firstUserMessage) === '') {
                $emit('title-update', '</stream>');

                return;
            }

            $fallbackTitle = $this->defaultTitleFromMessage($firstUserMessage);
            $resolved = $this->resolveConversationModel($conversation);

            try {
                $response = ChatTitleAgent::make()->prompt(
                    $this->titlePrompt($firstUserMessage),
                    provider: $resolved['provider'],
                    model: $resolved['model_id'],
                );

                $title = $this->sanitizeTitle($response->text, $fallbackTitle);
            } catch (\Throwable $e) {
                Log::warning('Chat title generation failed: '.$e->getMessage());

                $title = $fallbackTitle;
            }

            DB::table('chats')
                ->where('id', $chat->id)
                ->where('user_id', $user->id)
                ->update([
                    'title' => $title,
                    'is_title_generated' => true,
                    'updated_at' => now(),
                ]);

            $payload = json_encode(['title' => $title]) ?: '{}';
            $emit('title-update', $payload);
            $emit('title-update', '</stream>');
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:80'],
            'model' => ['nullable', 'string', Rule::in(AiProviderRegistry::validModelIds())],
        ]);

        $user = $request->user();
        $chatId = Str::ulid()->toString();
        $resolved = isset($validated['model'])
            ? $this->resolveModelFromId($validated['model'])
            : $this->resolveModelFromId(AiProviderRegistry::defaultModelId());

        $title = $validated['title'] ?? 'New Chat';

        if ($title === 'New Chat') {
            $reusableConversation = $this->findReusableDraftConversation($user->id);

            if ($reusableConversation) {
                $this->persistConversationModel($reusableConversation->id, $user->id, $resolved['provider'], $resolved['model_id']);

                return redirect("/chat/{$reusableConversation->id}");
            }
        }

        DB::table('chats')->insert([
            'id' => $chatId,
            'user_id' => $user->id,
            'title' => $title,
            'is_title_generated' => false,
            'provider' => $resolved['provider'],
            'model' => $resolved['model_id'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect("/chat/{$chatId}");
    }

    public function update(Request $request, Chat $chat): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:80'],
        ]);

        $user = $request->user();

        DB::table('chats')
            ->where('id', $chat->id)
            ->where('user_id', $user->id)
            ->update([
                'title' => $this->sanitizeTitle($validated['title'], 'New Chat'),
                'is_title_generated' => true,
                'updated_at' => now(),
            ]);

        return back();
    }

    public function updateModel(Request $request, Chat $chat): RedirectResponse
    {
        $validated = $request->validate([
            'model' => ['required', 'string', Rule::in(AiProviderRegistry::validModelIds())],
        ]);

        $user = $request->user();
        $conversation = $this->findConversationForUser($chat->id, $user->id);

        if (! $conversation) {
            abort(404, 'Conversation not found');
        }

        $resolved = $this->resolveModelFromId($validated['model']);

        $this->persistConversationModel($conversation->id, $user->id, $resolved['provider'], $resolved['model_id']);

        return back();
    }

    public function destroy(Request $request, Chat $chat): RedirectResponse
    {
        $user = $request->user();

        DB::table('chat_messages')
            ->where('conversation_id', $chat->id)
            ->where('user_id', $user->id)
            ->delete();

        DB::table('chats')
            ->where('id', $chat->id)
            ->where('user_id', $user->id)
            ->delete();

        return redirect('/chat')->with('success', 'Conversation deleted.');
    }

    private function getConversations(string $userId)
    {
        return DB::table('chats')
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();
    }

    private function getMessages(string $chatId)
    {
        return DB::table('chat_messages')
            ->where('conversation_id', $chatId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($message) => [
                'id' => $message->id,
                'role' => $message->role,
                'content' => $message->content,
                'attachments' => json_decode($message->attachments ?? '[]', true),
                'created_at' => $message->created_at,
            ]);
    }

    private function findConversationForUser(string $chatId, string $userId): ?object
    {
        return DB::table('chats')
            ->where('id', $chatId)
            ->where('user_id', $userId)
            ->first();
    }

    private function findReusableDraftConversation(string $userId): ?object
    {
        return DB::table('chats')
            ->where('user_id', $userId)
            ->where(function ($query): void {
                $query
                    ->where('title', 'New Chat')
                    ->orWhereNotExists(function ($subQuery): void {
                        $subQuery
                            ->selectRaw('1')
                            ->from('chat_messages')
                            ->whereColumn('chat_messages.conversation_id', 'chats.id');
                    });
            })
            ->orderByDesc('updated_at')
            ->first();
    }

    /**
     * @return array<int, array{provider: string, provider_label: string, models: array<int, array{value: string, label: string}>}>
     */
    private function availableModelGroups(): array
    {
        AiProviderRegistry::registerProviders();

        return AiProviderRegistry::groupedOptions();
    }

    /**
     * Resolve a model_id string to a provider + model_id + capabilities array.
     *
     * @return array{provider: string, model_id: string, supports_attachments: bool, supports_web_search: bool, supports_provider_storage: bool}
     */
    private function resolveModelFromId(string $modelId): array
    {
        $dbModel = AiProviderRegistry::resolveModel($modelId);

        if ($dbModel && $dbModel->provider) {
            return [
                'provider' => $dbModel->provider->slug,
                'model_id' => $dbModel->model_id,
                'supports_attachments' => $dbModel->supports_attachments,
                'supports_web_search' => $dbModel->supports_web_search,
                'supports_provider_storage' => $dbModel->supports_provider_storage,
            ];
        }

        // Fallback to ChatModel enum
        $enumModel = ChatModel::tryFrom($modelId);

        if ($enumModel) {
            return [
                'provider' => $enumModel->provider(),
                'model_id' => $enumModel->value,
                'supports_attachments' => $enumModel->supportsAttachments(),
                'supports_web_search' => $enumModel->supportsWebSearch(),
                'supports_provider_storage' => $enumModel->supportsProviderStorage(),
            ];
        }

        // Ultimate fallback
        $default = ChatModel::default();

        return [
            'provider' => $default->provider(),
            'model_id' => $default->value,
            'supports_attachments' => $default->supportsAttachments(),
            'supports_web_search' => $default->supportsWebSearch(),
            'supports_provider_storage' => $default->supportsProviderStorage(),
        ];
    }

    /**
     * @return array{provider: string, model_id: string, supports_attachments: bool, supports_web_search: bool, supports_provider_storage: bool}
     */
    private function resolveConversationModel(object $conversation): array
    {
        if (is_string($conversation->model)) {
            return $this->resolveModelFromId($conversation->model);
        }

        return $this->resolveModelFromId(AiProviderRegistry::defaultModelId());
    }

    private function persistConversationModel(string $chatId, string $userId, string $provider, string $modelId): void
    {
        DB::table('chats')
            ->where('id', $chatId)
            ->where('user_id', $userId)
            ->update([
                'provider' => $provider,
                'model' => $modelId,
                'updated_at' => now(),
            ]);
    }

    private function resolveAttachments(array $attachmentsData, string $provider): array
    {
        if (empty($attachmentsData)) {
            return [];
        }

        $attachmentService = app(ChatAttachmentService::class);
        $attachments = [];

        foreach ($attachmentsData as $data) {
            $attachment = ChatAttachment::fromArray($data);
            $providerFile = $attachmentService->getProviderFile($attachment, $provider);

            if ($providerFile) {
                $attachments[] = $providerFile;
            }
        }

        return $attachments;
    }

    private function setDefaultTitleFromFirstMessage(object $conversation, string $message): void
    {
        if ((bool) ($conversation->is_title_generated ?? false)) {
            return;
        }

        if ($conversation->title !== 'New Chat') {
            return;
        }

        DB::table('chats')
            ->where('id', $conversation->id)
            ->update([
                'title' => $this->defaultTitleFromMessage($message),
                'updated_at' => now(),
            ]);
    }

    private function defaultTitleFromMessage(string $message): string
    {
        $normalized = preg_replace('/\s+/', ' ', trim($message)) ?? '';

        if ($normalized === '') {
            return 'New Chat';
        }

        return Str::of($normalized)->limit(60, '...')->toString();
    }

    private function sanitizeTitle(string $title, string $fallback): string
    {
        $normalized = preg_replace('/\s+/', ' ', trim($title)) ?? '';
        $normalized = trim($normalized, " \t\n\r\0\x0B\"'");

        if ($normalized === '') {
            $normalized = $fallback;
        }

        return Str::of($normalized)->limit(80, '...')->toString();
    }

    private function titlePrompt(string $firstUserMessage): string
    {
        return <<<PROMPT
Generate a concise chat title from the first user message.

Rules:
- 3 to 6 words.
- Return title only.
- No quotes.
- No trailing punctuation.

First user message:
{$firstUserMessage}
PROMPT;
    }
}
