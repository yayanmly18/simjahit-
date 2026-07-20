<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\CustomerApiController;
use App\Http\Controllers\Api\ServiceApiController;
use App\Http\Controllers\Api\ExpenseApiController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WhatsAppController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/', function () {
    return view('app');
});

// API routes with session-based auth (web middleware)
Route::middleware('auth')->prefix('api')->group(function () {
    // Auth me
    Route::get('/me', [AuthController::class, 'me']);

    // Customer API
    Route::get('/customers', [CustomerApiController::class, 'index']);
    Route::post('/customers', [CustomerApiController::class, 'store']);
    Route::get('/customers/{id}', [CustomerApiController::class, 'show']);
    Route::put('/customers/{id}', [CustomerApiController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerApiController::class, 'destroy']);

    // Order API
    Route::get('/orders', [OrderController::class, 'apiIndex']);
    Route::post('/orders', [OrderController::class, 'apiStore']);
    Route::get('/orders/{order}', [OrderController::class, 'apiShow']);
    Route::put('/orders/{order}', [OrderController::class, 'apiUpdate']);
    Route::delete('/orders/{order}', [OrderController::class, 'apiDestroy']);
    Route::post('/orders/{order}/status', [OrderController::class, 'apiUpdateStatus']);

    // Payment API
    Route::get('/orders/{order}/payments', [PaymentController::class, 'apiIndex']);
    Route::post('/orders/{order}/payments', [PaymentController::class, 'apiStore']);

    // WhatsApp API
    Route::post('/orders/{order}/send-wa', [WhatsAppController::class, 'apiSendOrderNotification']);
    Route::post('/orders/{order}/send-reminder', [WhatsAppController::class, 'apiSendPaymentReminder']);

    // Settings API
    Route::get('/settings', [\App\Http\Controllers\Api\SettingsApiController::class, 'index']);
    Route::put('/settings', [\App\Http\Controllers\Api\SettingsApiController::class, 'update']);

    // Services API
    Route::get('/services', [ServiceApiController::class, 'index']);
    Route::post('/services', [ServiceApiController::class, 'store']);
    Route::put('/services/{service}', [ServiceApiController::class, 'update']);
    Route::delete('/services/{service}', [ServiceApiController::class, 'destroy']);

    // Expenses API
    Route::get('/expenses', [ExpenseApiController::class, 'index']);
    Route::post('/expenses', [ExpenseApiController::class, 'store']);
    Route::put('/expenses/{expense}', [ExpenseApiController::class, 'update']);
    Route::delete('/expenses/{expense}', [ExpenseApiController::class, 'destroy']);

    // Notifications API
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationApiController::class, 'index']);
    Route::get('/notifications/unread', [\App\Http\Controllers\Api\NotificationApiController::class, 'unread']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationApiController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationApiController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationApiController::class, 'destroy']);
    Route::delete('/notifications', [\App\Http\Controllers\Api\NotificationApiController::class, 'clearAll']);

    // Dashboard Stats API
    Route::get('/dashboard/stats', function () {
        $today = \Carbon\Carbon::today()->toDateString();

        $todayOrders = \App\Models\Order::whereDate('order_date', $today)->count();
        $inProgress = \App\Models\Order::whereIn('status', ['pending', 'processing', 'finishing'])->count();
        $completed = \App\Models\Order::where('status', 'completed')->count();
        $notPickedUp = \App\Models\Order::where('status', 'completed')->count();
        $todayRevenue = \App\Models\Order::whereDate('order_date', $today)->sum('down_payment');

        return response()->json([
            'todayOrders' => $todayOrders,
            'inProgress' => $inProgress,
            'completed' => $completed,
            'notPickedUp' => $notPickedUp,
            'todayRevenue' => $todayRevenue,
        ]);
    });
});