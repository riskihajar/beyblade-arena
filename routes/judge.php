<?php

use App\Http\Controllers\Judge\JudgeConsoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('judge')->name('judge.')->group(function () {
    Route::get('console', [JudgeConsoleController::class, 'index'])->name('console');
    Route::get('matches/{match}', [JudgeConsoleController::class, 'show'])->name('matches.show');
    Route::post('matches/{match}/battle', [JudgeConsoleController::class, 'recordBattle'])->name('matches.battle');
    Route::post('matches/{match}/walkover', [JudgeConsoleController::class, 'walkover'])->name('matches.walkover');
    Route::post('matches/{match}/dispute', [JudgeConsoleController::class, 'dispute'])->name('matches.dispute');
    Route::post('matches/{match}/correct', [JudgeConsoleController::class, 'correctScore'])->name('matches.correct');
});
