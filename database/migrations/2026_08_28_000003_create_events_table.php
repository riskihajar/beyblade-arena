<?php

use App\Enums\EventStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('season_id')->nullable()->constrained('seasons')->nullOnDelete();
            $table->foreignUlid('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('venue_name');
            $table->text('venue_address')->nullable();
            $table->string('venue_city')->default('Samarinda');
            $table->string('venue_maps_url')->nullable();
            $table->string('banner_path')->nullable();
            $table->dateTime('registration_start_at');
            $table->dateTime('registration_end_at');
            $table->dateTime('event_start_at');
            $table->dateTime('event_end_at')->nullable();
            $table->string('status')->default(EventStatusEnum::DRAFT->value)->index();
            $table->decimal('entry_fee', 12, 2)->default(0);
            $table->decimal('tier_multiplier', 4, 2)->default(1.00);
            $table->boolean('is_ranking_eligible')->default(true);
            $table->text('rules_and_regulations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
