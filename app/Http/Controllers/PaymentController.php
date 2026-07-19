<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function create(Order $order)
    {
        return view('payments.create', compact('order'));
    }

    public function store(Request $request, Order $order)
    {
        $validated = $request->validate([
            'type' => 'required|in:down_payment,remaining_payment,full_payment',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,transfer,ewallet',
            'notes' => 'nullable|string',
        ]);

        $validated['order_id'] = $order->id;
        $validated['payment_date'] = now();

        Payment::create($validated);

        $this->recalcOrder($order);

        return redirect()->route('orders.show', $order)
            ->with('success', 'Pembayaran berhasil dicatat!');
    }

    public function index(Order $order)
    {
        $payments = $order->payments()->latest()->get();
        return view('payments.index', compact('order', 'payments'));
    }

    // API Methods for React Frontend
    public function apiIndex(Order $order)
    {
        $payments = $order->payments()->latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'type' => $p->type,
                'amount' => (float) $p->amount,
                'payment_method' => $p->payment_method,
                'notes' => $p->notes ?? '',
                'payment_date' => $p->payment_date->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($payments);
    }

    public function apiStore(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:down_payment,remaining_payment,full_payment',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,transfer,ewallet',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = $order->payments()->create([
            'type' => $request->type,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'notes' => $request->notes ?? '',
            'payment_date' => now(),
        ]);

        $this->recalcOrder($order);

        return response()->json([
            'id' => $payment->id,
            'type' => $payment->type,
            'amount' => (float) $payment->amount,
            'payment_method' => $payment->payment_method,
            'notes' => $payment->notes ?? '',
            'payment_date' => $payment->payment_date->format('Y-m-d H:i:s'),
        ], 201);
    }

    private function recalcOrder(Order $order)
    {
        $order->refresh();
        $netTotal = $order->total_amount - $order->discount;
        $totalPaid = $order->payments()->sum('amount');

        if ($totalPaid >= $netTotal) {
            $order->update([
                'status' => 'paid',
                'remaining_payment' => 0,
            ]);
        } else {
            $order->update([
                'remaining_payment' => max(0, $netTotal - $totalPaid),
            ]);
        }
    }
}