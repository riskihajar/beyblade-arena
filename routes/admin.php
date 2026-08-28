<?php

use App\Http\Controllers\Admin\BracketController;
use App\Http\Controllers\Admin\CheckinController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\RegistrationManagementController;
use App\Http\Controllers\Admin\SeasonController;
use App\Http\Controllers\Admin\StadiumController;
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
    Route::post('seasons/{season}/recalculate', [SeasonController::class, 'recalculate'])->name('seasons.recalculate');
    Route::post('seasons/{season}/adjust-points', [SeasonController::class, 'adjustPoints'])->name('seasons.adjust-points');

    // Data Exports (Excel / CSV)
    Route::get('events/{event}/export-registrations', [\App\Http\Controllers\Admin\ExportController::class, 'exportRegistrations'])->name('events.export-registrations');
    Route::get('events/{event}/export-results', [\App\Http\Controllers\Admin\ExportController::class, 'exportResults'])->name('events.export-results');
    Route::get('seasons/{season}/export-leaderboard', [\App\Http\Controllers\Admin\ExportController::class, 'exportLeaderboard'])->name('seasons.export-leaderboard');

    // Stadiums & Match Calling
    Route::resource('stadiums', StadiumController::class);
    Route::post('matches/{match}/call', [StadiumController::class, 'callMatch'])->name('matches.call');

    // Bracket Engine & Visualization
    Route::get('categories/{category}/bracket', [BracketController::class, 'show'])->name('bracket.show');
    Route::post('categories/{category}/bracket/generate', [BracketController::class, 'generate'])->name('bracket.generate');
    Route::post('categories/{category}/bracket/regenerate', [BracketController::class, 'regenerate'])->name('bracket.regenerate');

    // Registration Management
    Route::get('registrations', [RegistrationManagementController::class, 'index'])->name('registrations.index');
    Route::post('registrations', [RegistrationManagementController::class, 'store'])->name('registrations.store');
    Route::patch('registrations/{registration}/status', [RegistrationManagementController::class, 'updateStatus'])->name('registrations.update-status');
    Route::patch('registrations/{registration}/override-deck', [RegistrationManagementController::class, 'overrideDeck'])->name('registrations.override-deck');
    Route::delete('registrations/{registration}', [RegistrationManagementController::class, 'destroy'])->name('registrations.destroy');

    // Venue Fast Check-in Console
    Route::get('checkin', [CheckinController::class, 'index'])->name('checkin.index');
    Route::post('checkin/{registration}', [CheckinController::class, 'checkin'])->name('checkin.checkin');
    Route::post('checkin/{registration}/no-show', [CheckinController::class, 'noShow'])->name('checkin.no-show');
    Route::post('checkin/{registration}/promote', [CheckinController::class, 'promote'])->name('checkin.promote');
});
