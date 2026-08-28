<?php

use App\Enums\RegistrationStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUlid('category_id')->constrained('tournament_categories')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('display_nickname');
            $table->unsignedSmallInteger('seed_number')->nullable();
            $table->string('group_code')->nullable()->index();
            $table->string('status')->default(RegistrationStatusEnum::PENDING->value)->index();
            $table->json('deck_data')->nullable();
            $table->boolean('is_deck_locked')->default(false);
            $table->text('guardian_details')->nullable(); // Encrypted & protected
            $table->dateTime('checked_in_at')->nullable();
            $table->string('disqualified_reason')->nullable();
            $table->timestamps();

            $table->unique(['category_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
