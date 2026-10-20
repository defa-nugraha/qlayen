<?php

use App\Http\Controllers\Customers\CustomerCaptureController;
use App\Http\Controllers\Customers\CustomerController;
use App\Http\Controllers\Customers\CustomerInteractionController;
use App\Http\Controllers\Customers\FollowUpController;
use App\Http\Controllers\Webhooks\WhatsAppDeliveryWebhookController;
use App\Http\Controllers\Workspaces\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('webhooks/whatsapp/delivery', WhatsAppDeliveryWebhookController::class)
    ->middleware('throttle:120,1')
    ->name('webhooks.whatsapp.delivery');

Route::get('c/{token}', [CustomerCaptureController::class, 'show'])
    ->middleware('throttle:30,1')
    ->name('capture.show');
Route::post('c/{token}', [CustomerCaptureController::class, 'capture'])
    ->middleware('throttle:10,1')
    ->name('capture.submit');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');
    Route::post('workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');
    Route::put('workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'updateMember'])->name('workspaces.members.update');
    Route::delete('workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'destroyMember'])->name('workspaces.members.destroy');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('follow-ups', [FollowUpController::class, 'index'])->name('follow-ups.index');
    Route::patch('follow-ups/{customer}/complete', [FollowUpController::class, 'complete'])->name('follow-ups.complete');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::get('customers/{customer}/interactions', [CustomerInteractionController::class, 'index'])
        ->name('customers.interactions.index');
    Route::post('customers/{customer}/interactions', [CustomerInteractionController::class, 'store'])
        ->name('customers.interactions.store');

    Route::get('capture-links', [CustomerCaptureController::class, 'index'])->name('capture.index');
    Route::post('capture-links', [CustomerCaptureController::class, 'store'])->name('capture.store');
    Route::patch('capture-links/{captureLink}/toggle', [CustomerCaptureController::class, 'toggle'])->name('capture.toggle');
});

require __DIR__.'/settings.php';
