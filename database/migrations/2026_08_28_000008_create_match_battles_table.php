<?php

use App\Enums\MatchFinishTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_battles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('match_id')->constrained('tournament_matches')->cascadeOnDelete();
            $table->unsignedSmallInteger('battle_number')->default(1);
            $table->foreignUlid('winner_id')->nullable()->constrained('registrations')->nullOnDelete();
            $table->string('finish_type')->default(MatchFinishTypeEnum::SPIN_FINISH->value);
            $table->unsignedSmallInteger('points_awarded')->default(1);
            $table->unsignedSmallInteger('player1_points_after')->default(0);
            $table->unsignedSmallInteger('player2_points_after')->default(0);
            $table->boolean('is_draw')->default(false);
            $table->string('notes')->nullable();
            $table->string('client_request_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_battles');
    }
};
