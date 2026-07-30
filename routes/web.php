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

// Public tracking page (no auth required)
Route::get('/track/{invoice}', [OrderController::class, 'track'])->name('track');

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

    // AI Dashboard Summary API
    Route::get('/dashboard/ai-summary', function () {
        $now = \Carbon\Carbon::now();
        $thisWeek = \Carbon\Carbon::now()->startOfWeek();
        $lastWeek = \Carbon\Carbon::now()->subWeek()->startOfWeek();

        // This week stats
        $thisWeekOrders = \App\Models\Order::where('order_date', '>=', $thisWeek)->count();
        $lastWeekOrders = \App\Models\Order::whereBetween('order_date', [$lastWeek, $thisWeek])->count();
        
        // Revenue comparison
        $thisWeekRevenue = \App\Models\Order::where('order_date', '>=', $thisWeek)->sum('total_amount');
        $lastWeekRevenue = \App\Models\Order::whereBetween('order_date', [$lastWeek, $thisWeek])->sum('total_amount');
        
        // Top service this week
        $topService = \App\Models\OrderItem::whereHas('order', function($q) use ($thisWeek) {
            $q->where('order_date', '>=', $thisWeek);
        })
        ->select('item_name', \Illuminate\Support\Facades\DB::raw('SUM(quantity) as total_qty'))
        ->groupBy('item_name')
        ->orderByDesc('total_qty')
        ->first();

        // Calculate growth
        $revenueGrowth = $lastWeekRevenue > 0 ? round((($thisWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100, 1) : 0;
        $orderGrowth = $lastWeekOrders > 0 ? round((($thisWeekOrders - $lastWeekOrders) / $lastWeekOrders) * 100, 1) : 0;

        // Generate summary
        $summary = [];
        
        // Orders summary
        if ($thisWeekOrders > 0) {
            $summary[] = "Minggu ini terdapat {$thisWeekOrders} pesanan";
        } else {
            $summary[] = "Belum ada pesanan minggu ini";
        }

        // Top service
        if ($topService) {
            $summary[] = "Layanan paling banyak adalah {$topService->item_name}";
        }

        // Revenue growth
        if ($revenueGrowth > 0) {
            $summary[] = "Pendapatan meningkat {$revenueGrowth}% dibanding minggu lalu";
        } elseif ($revenueGrowth < 0) {
            $summary[] = "Pendapatan turun " . abs($revenueGrowth) . "% dibanding minggu lalu";
        } else {
            $summary[] = "Pendapatan stabil dibanding minggu lalu";
        }

        // Additional insights
        $pendingOrders = \App\Models\Order::whereIn('status', ['pending', 'processing', 'finishing'])->count();
        if ($pendingOrders > 0) {
            $summary[] = "Ada {$pendingOrders} pesanan yang sedang diproses";
        }

        return response()->json([
            'summary' => implode('. ', $summary) . '.',
            'details' => [
                'thisWeekOrders' => $thisWeekOrders,
                'lastWeekOrders' => $lastWeekOrders,
                'orderGrowth' => $orderGrowth,
                'thisWeekRevenue' => $thisWeekRevenue,
                'lastWeekRevenue' => $lastWeekRevenue,
                'revenueGrowth' => $revenueGrowth,
                'topService' => $topService ? $topService->item_name : null,
            ]
        ]);
    });

    // AI Customer Loyalty Analysis API
    Route::get('/dashboard/customer-loyalty', function () {
        $sixMonthsAgo = \Carbon\Carbon::now()->subMonths(6)->toDateString();
        
        // Get customers with order counts in last 6 months
        $loyalCustomers = \App\Models\Order::where('order_date', '>=', $sixMonthsAgo)
            ->select('customer_id', \Illuminate\Support\Facades\DB::raw('COUNT(*) as order_count'), \Illuminate\Support\Facades\DB::raw('SUM(total_amount) as total_spent'))
            ->groupBy('customer_id')
            ->having('order_count', '>=', 3) // At least 3 orders in 6 months
            ->orderByDesc('order_count')
            ->limit(5)
            ->get();

        $loyaltyData = [];
        foreach ($loyalCustomers as $customerData) {
            $customer = \App\Models\Customer::find($customerData->customer_id);
            if ($customer) {
                $loyaltyData[] = [
                    'name' => $customer->name,
                    'order_count' => $customerData->order_count,
                    'total_spent' => $customerData->total_spent,
                    'period' => '6 bulan terakhir',
                ];
            }
        }

        // Generate summary
        $summary = [];
        if (count($loyaltyData) > 0) {
            $topLoyal = $loyaltyData[0];
            $summary[] = "Pelanggan paling loyal adalah {$topLoyal['name']} dengan {$topLoyal['order_count']} transaksi dalam 6 bulan terakhir";
            
            if (count($loyaltyData) > 1) {
                $summary[] = "Terdapat " . count($loyaltyData) . " pelanggan loyal dengan minimal 3 transaksi";
            }
        } else {
            $summary[] = "Belum ada pelanggan loyal yang terdeteksi";
        }

        return response()->json([
            'summary' => implode('. ', $summary) . '.',
            'loyal_customers' => $loyaltyData,
        ]);
    });

    // AI Completion Time Estimation API
    Route::post('/orders/estimate-completion', function (\Illuminate\Http\Request $request) {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'item_count' => 'required|integer|min:1',
            'difficulty' => 'required|in:easy,medium,hard',
        ]);

        $service = \App\Models\Service::find($request->service_id);
        if (!$service) {
            return response()->json(['error' => 'Layanan tidak ditemukan'], 404);
        }

        $baseDays = $service->estimated_days;
        $itemCount = $request->item_count;
        $difficulty = $request->difficulty;

        // Calculate estimated days
        $estimatedDays = $baseDays;

        // Add days for multiple items (each additional item adds 0.5x base days)
        if ($itemCount > 1) {
            $estimatedDays += ceil(($itemCount - 1) * $baseDays * 0.5);
        }

        // Adjust for difficulty
        $difficultyMultiplier = [
            'easy' => 1.0,
            'medium' => 1.5,
            'hard' => 2.0,
        ];

        $estimatedDays = ceil($estimatedDays * $difficultyMultiplier[$difficulty]);

        // Generate summary
        $difficultyText = [
            'easy' => 'mudah',
            'medium' => 'sedang',
            'hard' => 'sulit',
        ];

        $summary = "Estimasi pengerjaan {$estimatedDays} hari";
        $details = "Berdasarkan {$itemCount} item dengan tingkat kesulitan {$difficultyText[$difficulty]}";

        return response()->json([
            'estimated_days' => $estimatedDays,
            'summary' => $summary,
            'details' => $details,
        ]);
    });

    // AI Priority Recommendations API
    Route::get('/orders/priority-recommendations', function () {
        $now = \Carbon\Carbon::now();
        $today = \Carbon\Carbon::today();

        // Get active orders (pending, processing, finishing) with their items
        $orders = \App\Models\Order::with(['customer', 'orderItems'])
            ->whereIn('status', ['pending', 'processing', 'finishing'])
            ->whereNotNull('deadline')
            ->get();

        $recommendations = [];

        foreach ($orders as $order) {
            $deadline = \Carbon\Carbon::parse($order->deadline);
            $daysUntilDeadline = $now->diffInDays($deadline, false); // Can be negative if overdue
            
            // Calculate progress based on status
            $statusProgress = [
                'pending' => 0,
                'processing' => 50,
                'finishing' => 80,
            ];
            $progress = $statusProgress[$order->status] ?? 0;

            // Calculate priority score (lower is higher priority)
            // Factors:
            // 1. Deadline urgency (most important)
            // 2. Progress (less progress = higher priority)
            // 3. Order value (higher value = slightly higher priority)
            
            $priorityScore = 0;

            // Deadline factor (0-100 points, most critical)
            if ($daysUntilDeadline < 0) {
                // Overdue - highest priority
                $priorityScore += 100 + abs($daysUntilDeadline) * 10;
            } elseif ($daysUntilDeadline == 0) {
                // Due today
                $priorityScore += 90;
            } elseif ($daysUntilDeadline <= 1) {
                // Due tomorrow
                $priorityScore += 80;
            } elseif ($daysUntilDeadline <= 2) {
                // Due in 2 days
                $priorityScore += 70;
            } elseif ($daysUntilDeadline <= 3) {
                // Due in 3 days
                $priorityScore += 60;
            } elseif ($daysUntilDeadline <= 5) {
                // Due in 5 days
                $priorityScore += 50;
            } else {
                // Due in more than 5 days
                $priorityScore += max(10, 50 - $daysUntilDeadline * 2);
            }

            // Progress factor (0-30 points, less progress = higher priority)
            $priorityScore += (100 - $progress) * 0.3;

            // Order value factor (0-20 points)
            $orderValue = (float) $order->total_amount;
            if ($orderValue > 1000000) {
                $priorityScore += 20;
            } elseif ($orderValue > 500000) {
                $priorityScore += 15;
            } elseif ($orderValue > 200000) {
                $priorityScore += 10;
            } elseif ($orderValue > 100000) {
                $priorityScore += 5;
            }

            // Determine priority level and reason
            $priorityLevel = 'Rendah';
            $priorityReason = '';
            $priorityColor = 'gray';

            if ($daysUntilDeadline < 0) {
                $priorityLevel = 'Sangat Tinggi';
                $priorityColor = 'red';
                $priorityReason = "Terlambat " . abs($daysUntilDeadline) . " hari";
            } elseif ($daysUntilDeadline == 0) {
                $priorityLevel = 'Sangat Tinggi';
                $priorityColor = 'red';
                $priorityReason = "Deadline hari ini";
            } elseif ($daysUntilDeadline <= 1) {
                $priorityLevel = 'Tinggi';
                $priorityColor = 'orange';
                $priorityReason = "Deadline besok";
            } elseif ($daysUntilDeadline <= 2) {
                $priorityLevel = 'Tinggi';
                $priorityColor = 'orange';
                $priorityReason = "Deadline " . ($daysUntilDeadline == 1 ? "besok" : $daysUntilDeadline . " hari lagi");
            } elseif ($daysUntilDeadline <= 3) {
                $priorityLevel = 'Sedang';
                $priorityColor = 'yellow';
                $priorityReason = "Deadline " . $daysUntilDeadline . " hari lagi";
            } else {
                $priorityLevel = 'Rendah';
                $priorityColor = 'blue';
                $priorityReason = "Deadline " . $daysUntilDeadline . " hari lagi";
            }

            // Adjust priority based on progress
            if ($progress < 20 && $daysUntilDeadline <= 2) {
                $priorityLevel = 'Sangat Tinggi';
                $priorityColor = 'red';
                $priorityReason .= " (baru dimulai)";
            } elseif ($progress < 50 && $daysUntilDeadline <= 3) {
                if ($priorityLevel !== 'Sangat Tinggi') {
                    $priorityLevel = 'Tinggi';
                    $priorityColor = 'orange';
                }
                $priorityReason .= " (progres " . $progress . "%)";
            }

            $recommendations[] = [
                'id' => $order->id,
                'invoice' => $order->order_number,
                'customer' => $order->customer->name,
                'phone' => $order->customer->phone,
                'status' => $this->getStatusLabel($order->status),
                'backend_status' => $order->status,
                'deadline' => \Carbon\Carbon::parse($order->deadline)->format('Y-m-d'),
                'days_until_deadline' => (int) $daysUntilDeadline,
                'progress' => $progress,
                'price' => (float) $order->total_amount,
                'priority_score' => round($priorityScore, 2),
                'priority_level' => $priorityLevel,
                'priority_color' => $priorityColor,
                'priority_reason' => $priorityReason,
                'item_count' => $order->orderItems->count(),
                'created_at' => \Carbon\Carbon::parse($order->order_date)->format('Y-m-d'),
            ];
        }

        // Sort by priority score (highest first)
        usort($recommendations, function ($a, $b) {
            return $b['priority_score'] <=> $a['priority_score'];
        });

        // Generate AI summary
        $summary = [];
        $overdueCount = count(array_filter($recommendations, fn($r) => $r['days_until_deadline'] < 0));
        $todayCount = count(array_filter($recommendations, fn($r) => $r['days_until_deadline'] == 0));
        $tomorrowCount = count(array_filter($recommendations, fn($r) => $r['days_until_deadline'] == 1));

        if ($overdueCount > 0) {
            $summary[] = "Ada {$overdueCount} pesanan yang terlambat";
        }
        if ($todayCount > 0) {
            $summary[] = "{$todayCount} pesanan dengan deadline hari ini";
        }
        if ($tomorrowCount > 0) {
            $summary[] = "{$tomorrowCount} pesanan dengan deadline besok";
        }
        
        $highPriority = count(array_filter($recommendations, fn($r) => in_array($r['priority_level'], ['Sangat Tinggi', 'Tinggi'])));
        if ($highPriority > 0) {
            $summary[] = "{$highPriority} pesanan memerlukan perhatian prioritas";
        }

        if (empty($summary)) {
            $summary[] = "Semua pesanan dalam kondisi baik";
        }

        return response()->json([
            'recommendations' => $recommendations,
            'summary' => implode('. ', $summary) . '.',
            'total_active_orders' => count($recommendations),
        ]);
    });
});
