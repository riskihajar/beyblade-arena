<?php

use App\Http\Controllers\Admin\CheckinController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\RegistrationManagementController;
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
