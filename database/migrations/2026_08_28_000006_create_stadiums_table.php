<?php

use App\Enums\StadiumStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stadiums', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignUlid('assigned_judge_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('model_type')->default('Extreme Stadium BX-07/10');
            $table->string('status')->default(StadiumStatusEnum::AVAILABLE->value)->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stadiums');
    }
};
