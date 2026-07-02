<?php

use Zerp\GoogleMeet\Http\Controllers\GoogleMeetController;

use Illuminate\Support\Facades\Route;
use Zerp\GoogleMeet\Http\Controllers\GoogleMeetSettingsController;

Route::middleware(['web', 'auth', 'verified', 'PlanModuleCheck:GoogleMeet'])->group(function () {
    Route::post('/google-meet/settings', [GoogleMeetSettingsController::class, 'update'])->name('google-meet.settings.update');

    Route::prefix('google-meets')->name('googlemeet.google-meets.')->group(function () {
        Route::get('/', [GoogleMeetController::class, 'index'])->name('index');
        Route::post('/', [GoogleMeetController::class, 'store'])->name('store');

        Route::put('/{googlemeeting}', [GoogleMeetController::class, 'update'])->name('update');
        Route::delete('/{googlemeeting}', [GoogleMeetController::class, 'destroy'])->name('destroy');
        Route::patch('/{googlemeeting}/status', [GoogleMeetController::class, 'updateStatus'])->name('update-status');
    });
});