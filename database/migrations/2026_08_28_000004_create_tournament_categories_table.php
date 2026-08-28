<?php

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUlid('ruleset_id')->constrained('tournament_rulesets')->restrictOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedSmallInteger('min_age')->nullable();
            $table->unsignedSmallInteger('max_age')->nullable();
            $table->unsignedSmallInteger('max_participants')->default(32);
            $table->string('format')->default(EventFormatEnum::SINGLE_ELIMINATION->value);
            $table->json('stage_config')->nullable();
            $table->string('deck_lock_policy')->default(DeckLockPolicyEnum::UNTIL_CHECKIN->value);
            $table->json('tie_breaker_priority')->nullable();
            $table->unsignedSmallInteger('call_timeout_seconds')->default(180);
            $table->unsignedSmallInteger('target_points')->default(4);
            $table->timestamps();

            $table->unique(['event_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_categories');
    }
};
