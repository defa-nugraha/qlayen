<?php

use App\Http\Controllers\BrandAssetController;
use App\Http\Controllers\Customers\ActivationQrCodeController;
use App\Http\Controllers\Customers\CustomerCaptureController;
use App\Http\Controllers\Customers\CustomerController;
use App\Http\Controllers\Customers\CustomerInteractionController;
use App\Http\Controllers\Customers\FollowUpController;
use App\Http\Controllers\Workspaces\WorkspaceController;
use App\Http\Controllers\Workspaces\WhatsAppSettingsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('c/{token}', [CustomerCaptureController::class, 'show'])
    ->middleware('throttle:30,1')
    ->name('capture.show');
Route::post('c/{token}', [CustomerCaptureController::class, 'capture'])
    ->middleware('throttle:10,1')
    ->name('capture.submit');

Route::get('activate/{token}', [ActivationQrCodeController::class, 'show'])
    ->middleware('throttle:30,1')
    ->name('activation-qr.show');
Route::post('activate/{token}', [ActivationQrCodeController::class, 'activate'])
    ->middleware('throttle:5,1')
    ->name('activation-qr.activate');
Route::post('activate/{token}/capture', [ActivationQrCodeController::class, 'capture'])
    ->middleware('throttle:10,1')
    ->name('activation-qr.capture');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('brand-assets', [BrandAssetController::class, 'index'])->name('brand-assets.index');
    Route::post('brand-assets', [BrandAssetController::class, 'store'])->name('brand-assets.store');
    Route::delete('brand-assets/{key}', [BrandAssetController::class, 'destroy'])->name('brand-assets.destroy');

    Route::get('workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');

    Route::get('whatsapp/settings', [WhatsAppSettingsController::class, 'index'])->name('whatsapp.settings');
    Route::put('whatsapp/settings', [WhatsAppSettingsController::class, 'update'])->name('whatsapp.settings.update');
    Route::post('whatsapp/qr', [WhatsAppSettingsController::class, 'qr'])->middleware('throttle:12,1')->name('whatsapp.qr');
    Route::post('whatsapp/test', [WhatsAppSettingsController::class, 'test'])->middleware('throttle:5,1')->name('whatsapp.test');
    Route::post('workspaces', [WorkspaceController::class, 'store'])
        ->name('workspaces.store');
    Route::put('workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'updateMember'])
        ->name('workspaces.members.update');
    Route::delete('workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'destroyMember'])
        ->name('workspaces.members.destroy');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('follow-ups', [FollowUpController::class, 'index'])->name('follow-ups.index');
    Route::patch('follow-ups/{customer}/complete', [FollowUpController::class, 'complete'])
        ->name('follow-ups.complete');

    Route::post('customers', [CustomerController::class, 'store'])
        ->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])
        ->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])
        ->name('customers.destroy');
    Route::get('customers/{customer}/interactions', [CustomerInteractionController::class, 'index'])
        ->name('customers.interactions.index');
    Route::post('customers/{customer}/interactions', [CustomerInteractionController::class, 'store'])
        ->name('customers.interactions.store');

    Route::get('capture-links', [CustomerCaptureController::class, 'index'])->name('capture.index');
    Route::post('capture-links', [CustomerCaptureController::class, 'store'])
        ->name('capture.store');
    Route::patch('capture-links/{captureLink}/toggle', [CustomerCaptureController::class, 'toggle'])
        ->name('capture.toggle');

    Route::get('activation-qr-codes', [ActivationQrCodeController::class, 'index'])->name('activation-qr.index');
    Route::post('activation-qr-codes', [ActivationQrCodeController::class, 'store'])
        ->name('activation-qr.store');
    Route::patch('activation-qr-codes/{activationQrCode}/toggle', [ActivationQrCodeController::class, 'toggle'])
        ->name('activation-qr.toggle');
});

require __DIR__.'/settings.php';
