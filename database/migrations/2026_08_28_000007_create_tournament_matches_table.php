<?php

use App\Enums\MatchStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('category_id')->constrained('tournament_categories')->cascadeOnDelete();
            $table->foreignUlid('stadium_id')->nullable()->constrained('stadiums')->nullOnDelete();
            $table->foreignUlid('judge_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedSmallInteger('round_number')->default(1);
            $table->unsignedSmallInteger('match_order')->default(1);
            $table->unsignedSmallInteger('bracket_position')->default(1);
            $table->foreignUlid('next_match_id')->nullable()->constrained('tournament_matches')->nullOnDelete();
            $table->string('group_code')->nullable()->index();
            $table->string('bracket_type')->default('winners'); // winners, losers, group, bronze, finals
            $table->foreignUlid('player1_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->foreignUlid('player2_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->foreignUlid('winner_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->unsignedSmallInteger('player1_score')->default(0);
            $table->unsignedSmallInteger('player2_score')->default(0);
            $table->string('status')->default(MatchStatusEnum::SCHEDULED->value)->index();
            $table->dateTime('called_at')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->json('ruleset_snapshot')->nullable();
            $table->boolean('is_disputed')->default(false);
            $table->text('dispute_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_matches');
    }
};
