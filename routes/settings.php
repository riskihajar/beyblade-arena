<?php

use App\Http\Controllers\Settings\ActivityLogController;
use App\Http\Controllers\Settings\AiSettingController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Settings\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::patch('settings/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('settings/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::middleware(['permission:admin.access'])->prefix('settings')->name('settings.')->group(function () {
        Route::get('activities', [ActivityLogController::class, 'index'])->name('activities.index');
        Route::get('activities/export', [ActivityLogController::class, 'export'])->name('activities.export');
        Route::get('activities/{activity}', [ActivityLogController::class, 'show'])->name('activities.show');
        Route::get('users/export', [UserController::class, 'export'])->name('users.export');
        Route::delete('users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
        Route::patch('users/{user}/unverify', [UserController::class, 'unverify'])->name('users.unverify');
        Route::get('roles/export', [RoleController::class, 'export'])->name('roles.export');
        Route::resource('roles', RoleController::class)->except('show');

        // AI Settings — Providers
        Route::patch('ai/providers/toggle-active', [AiSettingController::class, 'providersToggleActive'])->name('ai.providers.toggle-active');
        Route::get('ai/providers', [AiSettingController::class, 'providersIndex'])->name('ai.providers.index');
        Route::get('ai/providers/create', [AiSettingController::class, 'providersCreate'])->name('ai.providers.create');
        Route::post('ai/providers', [AiSettingController::class, 'providersStore'])->name('ai.providers.store');
        Route::get('ai/providers/{provider}/edit', [AiSettingController::class, 'providersEdit'])->name('ai.providers.edit');
        Route::patch('ai/providers/{provider}', [AiSettingController::class, 'providersUpdate'])->name('ai.providers.update');
        Route::delete('ai/providers/{provider}', [AiSettingController::class, 'providersDestroy'])->name('ai.providers.destroy');
        Route::post('ai/providers/{provider}/test-connection', [AiSettingController::class, 'providersTestConnection'])->name('ai.providers.test-connection');
        Route::get('ai/providers/{provider}/models', [AiSettingController::class, 'providersListModels'])->name('ai.providers.list-models');

        // AI Settings — Models
        Route::patch('ai/models/toggle-active', [AiSettingController::class, 'modelsToggleActive'])->name('ai.models.toggle-active');
        Route::get('ai/models', [AiSettingController::class, 'modelsIndex'])->name('ai.models.index');
        Route::get('ai/models/create', [AiSettingController::class, 'modelsCreate'])->name('ai.models.create');
        Route::post('ai/models', [AiSettingController::class, 'modelsStore'])->name('ai.models.store');
        Route::get('ai/models/{model}/edit', [AiSettingController::class, 'modelsEdit'])->name('ai.models.edit');
        Route::patch('ai/models/{model}', [AiSettingController::class, 'modelsUpdate'])->name('ai.models.update');
        Route::delete('ai/models/{model}', [AiSettingController::class, 'modelsDestroy'])->name('ai.models.destroy');
    });
});
