<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournament_rulesets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('generation')->default('X'); // X, Burst, Metal, Plastic
            $table->unsignedSmallInteger('points_to_win')->default(4);
            $table->unsignedSmallInteger('spin_finish_points')->default(1);
            $table->unsignedSmallInteger('over_finish_points')->default(2);
            $table->unsignedSmallInteger('burst_finish_points')->default(2);
            $table->unsignedSmallInteger('xtreme_finish_points')->default(3);
            $table->unsignedSmallInteger('penalty_points')->default(1);
            $table->json('custom_rules_config')->nullable();
            $table->boolean('is_official')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_rulesets');
    }
};
