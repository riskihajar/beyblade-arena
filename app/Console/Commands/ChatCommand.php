<?php

namespace App\Console\Commands;

use App\Agents\ChatAgent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\ConversationStore;

class ChatCommand extends Command
{
    protected $signature = 'chat
                            {prompt? : The prompt to send}
                            {--model= : The model to use (e.g., gpt-5.2, gpt-4o)}
                            {--provider= : The provider to use (e.g., openai)}
                            {--continue : Continue the last conversation}';

    protected $description = 'Start an interactive chat session with AI';

    protected ?string $currentConversationId = null;

    protected ?object $currentUser = null;

    public function handle(): int
    {
        $model = $this->option('model') ?? 'gpt-5.2';
        $provider = $this->option('provider') ?? 'openai';

        $prompt = $this->argument('prompt');

        if ($prompt) {
            return $this->sendSinglePrompt($prompt, $provider, $model);
        }

        return $this->startInteractiveMode($provider, $model);
    }

    protected function sendSinglePrompt(string $prompt, string $provider, string $model): int
    {
        $this->currentUser = $this->getUser();

        if ($this->option('continue')) {
            $this->currentConversationId = $this->getLatestConversationId();
            if ($this->currentConversationId) {
                $this->info("📜 Continuing conversation: {$this->currentConversationId}\n");
            }
        }

        try {
            $response = $this->sendMessage($prompt, $provider, $model);
            $this->line($response->text);

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Error: '.$e->getMessage());

            return Command::FAILURE;
        }
    }

    protected function startInteractiveMode(string $provider, string $model): int
    {
        $this->info("🤖 Chat started (provider: {$provider}, model: {$model})");
        $this->info("Type 'quit' or 'exit' to end the session.\n");

        if ($this->option('continue')) {
            $this->currentConversationId = $this->getLatestConversationId();
            if ($this->currentConversationId) {
                $this->info("📜 Continuing conversation: {$this->currentConversationId}\n");
            } else {
                $this->warn("No previous conversation found. Starting fresh.\n");
            }
        }

        $this->currentUser = $this->getUser();

        while (true) {
            $input = $this->ask('You');

            if (in_array(strtolower($input), ['quit', 'exit', 'q'])) {
                $this->info('👋 Goodbye!');
                break;
            }

            if (empty(trim($input))) {
                continue;
            }

            try {
                $response = $this->sendMessage($input, $provider, $model);
                $this->line("\nAI: ".$response->text."\n");
            } catch (\Throwable $e) {
                $this->error('Error: '.$e->getMessage());
            }
        }

        return Command::SUCCESS;
    }

    protected function sendMessage(string $prompt, string $provider, string $model)
    {
        $agent = ChatAgent::make();

        if ($this->currentUser) {
            $agent->forUser($this->currentUser);

            if ($this->currentConversationId) {
                $agent->continue($this->currentConversationId, $this->currentUser);
            }
        }

        $response = $agent->prompt($prompt, provider: $provider, model: $model);

        if ($response->conversationId) {
            $this->currentConversationId = $response->conversationId;
        }

        return $response;
    }

    protected function getLatestConversationId(): ?string
    {
        if (! $this->currentUser) {
            return null;
        }

        $conversationId = app(ConversationStore::class)->latestConversationId($this->currentUser->id);

        return $conversationId;
    }

    protected function getUser(): ?object
    {
        $userId = config('ai.chat.user_id');

        if (! $userId) {
            $user = DB::table('users')->first();

            return $user ? (object) ['id' => $user->id] : null;
        }

        return (object) ['id' => $userId];
    }
}
