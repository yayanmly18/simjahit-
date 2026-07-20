<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\ThermalPrinterService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('customer')->latest()->paginate(10);
        return view('orders.index', compact('orders'));
    }

    public function create()
    {
        $customers = Customer::all();
        return view('orders.create', compact('customers'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'required|date',
            'deadline' => 'nullable|date|after:order_date',
            'notes' => 'nullable|string',
            'down_payment' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.category' => 'nullable|string|max:100',
            'items.*.fabric_type' => 'nullable|string|max:100',
            'items.*.color' => 'nullable|string|max:50',
            'items.*.size' => 'nullable|string|max:20',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.measurements' => 'nullable|array',
            'items.*.notes' => 'nullable|string',
        ]);

        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $totalAmount = 0;
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['price'] * $item['quantity'];
        }

        $discount = $validated['discount'] ?? 0;
        $downPayment = $validated['down_payment'] ?? 0;
        $remainingPayment = max(0, $totalAmount - $discount - $downPayment);

        $order = Order::create([
            'customer_id' => $validated['customer_id'],
            'order_number' => $orderNumber,
            'order_date' => $validated['order_date'],
            'deadline' => $validated['deadline'],
            'notes' => $validated['notes'],
            'total_amount' => $totalAmount,
            'discount' => $discount,
            'down_payment' => $downPayment,
            'remaining_payment' => $remainingPayment,
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            $order->orderItems()->create($item);
        }

        if ($downPayment > 0) {
            $order->payments()->create([
                'type' => 'down_payment',
                'amount' => $downPayment,
                'payment_method' => 'cash',
                'payment_date' => now(),
            ]);
        }

        return redirect()->route('orders.show', $order)
            ->with('success', 'Pesanan berhasil dibuat!');
    }

    public function show(Order $order)
    {
        $order->load(['customer', 'orderItems', 'payments']);
        return view('orders.show', compact('order'));
    }

    public function edit(Order $order)
    {
        $order->load('orderItems');
        $customers = Customer::all();
        return view('orders.edit', compact('order', 'customers'));
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'required|date',
            'deadline' => 'nullable|date|after:order_date',
            'status' => 'required|in:pending,processing,finishing,completed,paid,cancelled',
            'notes' => 'nullable|string',
            'down_payment' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.category' => 'nullable|string|max:100',
            'items.*.fabric_type' => 'nullable|string|max:100',
            'items.*.color' => 'nullable|string|max:50',
            'items.*.size' => 'nullable|string|max:20',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.measurements' => 'nullable|array',
            'items.*.notes' => 'nullable|string',
        ]);

        $totalAmount = 0;
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['price'] * $item['quantity'];
        }

        $discount = $validated['discount'] ?? 0;
        $downPayment = $validated['down_payment'] ?? $order->down_payment;
        $remainingPayment = max(0, $totalAmount - $discount - $downPayment);

        $order->update([
            'customer_id' => $validated['customer_id'],
            'order_date' => $validated['order_date'],
            'deadline' => $validated['deadline'],
            'status' => $validated['status'],
            'notes' => $validated['notes'],
            'total_amount' => $totalAmount,
            'discount' => $discount,
            'down_payment' => $downPayment,
            'remaining_payment' => $remainingPayment,
        ]);

        $order->orderItems()->delete();
        foreach ($validated['items'] as $item) {
            $order->orderItems()->create($item);
        }

        return redirect()->route('orders.show', $order)
            ->with('success', 'Pesanan berhasil diperbarui!');
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->route('orders.index')
            ->with('success', 'Pesanan berhasil dihapus!');
    }

    public function print(Order $order)
    {
        $order->load(['customer', 'orderItems']);

        try {
            $printerService = new ThermalPrinterService();
            $printerService->printOrderReceipt($order);
        } catch (\Exception $e) {
            \Log::error('Thermal printer error: ' . $e->getMessage());
        }

        return view('orders.print', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,finishing,completed,paid,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return redirect()->back()
            ->with('success', 'Status pesanan berhasil diperbarui!');
    }

    // API Methods for React Frontend
    public function apiIndex(Request $request)
    {
        $orders = Order::with(['customer', 'orderItems'])->latest()->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'invoice' => $order->order_number,
                'customer' => $order->customer->name,
                'phone' => $order->customer->phone,
                'clothingType' => $order->orderItems->first()->category ?? 'Multiple',
                'service' => $order->orderItems->first()->item_name ?? 'Multiple Items',
                'status' => $this->getStatusLabel($order->status),
                'deadline' => $order->deadline ? \Carbon\Carbon::parse($order->deadline)->format('Y-m-d') : '-',
                'price' => (float) $order->total_amount,
                'dp' => (float) $order->down_payment,
                'discount' => (float) $order->discount,
                'notes' => $order->notes ?? '',
                'createdAt' => \Carbon\Carbon::parse($order->order_date)->format('Y-m-d'),
            ];
        });

        return response()->json($orders);
    }

    public function apiStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'required|date',
            'deadline' => 'nullable|date',
            'notes' => 'nullable|string',
            'down_payment' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.category' => 'nullable|string|max:100',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $request->all();
        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $totalAmount = 0;
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['price'] * $item['quantity'];
        }

        $discount = $validated['discount'] ?? 0;
        $downPayment = $validated['down_payment'] ?? 0;
        $remainingPayment = max(0, $totalAmount - $discount - $downPayment);

        $order = Order::create([
            'customer_id' => $validated['customer_id'],
            'order_number' => $orderNumber,
            'order_date' => $validated['order_date'],
            'deadline' => $validated['deadline'],
            'notes' => $validated['notes'] ?? '',
            'total_amount' => $totalAmount,
            'discount' => $discount,
            'down_payment' => $downPayment,
            'remaining_payment' => $remainingPayment,
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            $order->orderItems()->create($item);
        }

        if ($downPayment > 0) {
            $order->payments()->create([
                'type' => 'down_payment',
                'amount' => $downPayment,
                'payment_method' => 'cash',
                'payment_date' => now(),
            ]);
        }

        // Create notification for new order
        try {
            $notifService = new NotificationService();
            $notifService->orderCreated($order);
        } catch (\Exception $e) {
            \Log::error('Failed to create notification: ' . $e->getMessage());
        }

        return response()->json([
            'id' => $order->id,
            'invoice' => $order->order_number,
        ], 201);
    }

    public function apiShow($id)
    {
        $order = Order::with(['customer', 'orderItems', 'payments'])->findOrFail($id);

        return response()->json([
            'id' => $order->id,
            'invoice' => $order->order_number,
            'customer' => $order->customer->name,
            'phone' => $order->customer->phone,
            'clothingType' => $order->orderItems->first()->category ?? 'Multiple',
            'service' => $order->orderItems->first()->item_name ?? 'Multiple Items',
            'status' => $this->getStatusLabel($order->status),
            'deadline' => $order->deadline ? \Carbon\Carbon::parse($order->deadline)->format('Y-m-d') : '-',
            'price' => (float) $order->total_amount,
            'dp' => (float) $order->down_payment,
            'discount' => (float) $order->discount,
            'notes' => $order->notes ?? '',
            'createdAt' => \Carbon\Carbon::parse($order->order_date)->format('Y-m-d'),
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'category' => $item->category,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'color' => $item->color,
                    'size' => $item->size,
                    'notes' => $item->notes ?? '',
                ];
            }),
        ]);
    }

    public function apiUpdate(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'order_date' => 'required|date',
            'deadline' => 'nullable|date',
            'status' => 'required|in:pending,processing,finishing,completed,paid,cancelled',
            'notes' => 'nullable|string',
            'down_payment' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $request->all();

        $discount = $validated['discount'] ?? $order->discount;
        $downPayment = $validated['down_payment'] ?? $order->down_payment;
        $remainingPayment = max(0, $order->total_amount - $discount - $downPayment);

        $order->update([
            'customer_id' => $validated['customer_id'],
            'order_date' => $validated['order_date'],
            'deadline' => $validated['deadline'],
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? '',
            'discount' => $discount,
            'down_payment' => $downPayment,
            'remaining_payment' => $remainingPayment,
        ]);

        return response()->json([
            'id' => $order->id,
            'invoice' => $order->order_number,
        ]);
    }

    public function apiDestroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(null, 204);
    }

    public function apiUpdateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,finishing,completed,paid,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        // Create notification for status change
        try {
            $notifService = new NotificationService();
            $notifService->orderStatusChanged($order, $oldStatus, $request->status);

            // If status changed to completed, also create ready for pickup notification
            if ($request->status === 'completed') {
                $notifService->orderReadyForPickup($order);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to create notification: ' . $e->getMessage());
        }

        return response()->json([
            'id' => $order->id,
            'status' => $this->getStatusLabel($order->status),
        ]);
    }

    private function getStatusLabel($status)
    {
        return match ($status) {
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'finishing' => 'Finishing',
            'completed' => 'Selesai',
            'paid' => 'Sudah Diambil',
            'cancelled' => 'Dibatalkan',
            default => $status
        };
    }
}