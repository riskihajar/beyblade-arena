<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_providers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('driver');
            $table->string('base_url')->nullable();
            $table->text('api_key')->nullable();
            $table->json('extra_config')->nullable();
            $table->boolean('is_active')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('ai_models', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('ai_provider_id')->index()->constrained('ai_providers')->cascadeOnDelete();
            $table->string('model_id');
            $table->string('name');
            $table->boolean('supports_web_search')->default(false);
            $table->boolean('supports_attachments')->default(true);
            $table->boolean('supports_images')->default(true);
            $table->boolean('supports_documents')->default(true);
            $table->boolean('supports_provider_storage')->default(false);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['ai_provider_id', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_models');
        Schema::dropIfExists('ai_providers');
    }
};
