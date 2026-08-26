<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Ai\Migrations\AiMigration;

return new class extends AiMigration
{
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->index();
            $table->string('title');
            $table->boolean('is_title_generated')->default(false);
            $table->string('provider')->nullable();
            $table->string('model')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'updated_at']);
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('conversation_id')->index();
            $table->foreignUlid('user_id')->index();
            $table->string('agent');
            $table->string('role', 25);
            $table->text('content');
            $table->text('attachments')->nullable();
            $table->text('tool_calls')->nullable();
            $table->text('tool_results')->nullable();
            $table->text('usage')->nullable();
            $table->text('meta')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'user_id', 'updated_at'], 'conversation_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chats');
    }
};
