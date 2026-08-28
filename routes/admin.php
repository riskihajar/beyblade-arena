<?php

use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\SeasonController;
use App\Http\Controllers\Admin\TournamentCategoryController;
use App\Http\Controllers\Admin\TournamentRulesetController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Events
    Route::resource('events', EventController::class);

    // Tournament Categories
    Route::resource('categories', TournamentCategoryController::class)->except(['index']);

    // Tournament Rulesets
    Route::resource('rulesets', TournamentRulesetController::class);

    // Seasons
    Route::resource('seasons', SeasonController::class);
});
