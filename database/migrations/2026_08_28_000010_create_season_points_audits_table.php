<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('season_points_audits', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('season_id')->constrained('seasons')->cascadeOnDelete();
            $table->foreignUlid('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('points_awarded');
            $table->json('calculation_breakdown')->nullable();
            $table->string('reason');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('season_points_audits');
    }
};
