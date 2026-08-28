<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('season_rankings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('season_id')->constrained('seasons')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('total_points')->default(0)->index();
            $table->unsignedSmallInteger('rank_position')->default(1)->index();
            $table->unsignedSmallInteger('tournaments_played')->default(0);
            $table->unsignedSmallInteger('tournaments_won')->default(0);
            $table->unsignedSmallInteger('matches_won')->default(0);
            $table->unsignedSmallInteger('matches_lost')->default(0);
            $table->json('details')->nullable();
            $table->timestamps();

            $table->unique(['season_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('season_rankings');
    }
};
