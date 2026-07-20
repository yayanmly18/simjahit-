<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerApiController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');

        $query = Customer::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->with('orders')->get()->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'whatsapp' => $customer->whatsapp ?? $customer->phone,
                'address' => $customer->address ?? '',
                'notes' => $customer->notes ?? '',
                'totalOrders' => $customer->orders->count(),
                'lastVisit' => $customer->orders->max('order_date') ? \Carbon\Carbon::parse($customer->orders->max('order_date'))->format('Y-m-d') : '-',
            ];
        });

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:customers',
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = Customer::create($request->all());

        // Create notification for new customer
        try {
            $notifService = new NotificationService();
            $notifService->customerCreated($customer->name, $customer->id);
        } catch (\Exception $e) {
            \Log::error('Failed to create notification: ' . $e->getMessage());
        }

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'whatsapp' => $customer->whatsapp ?? $customer->phone,
            'address' => $customer->address ?? '',
            'notes' => $customer->notes ?? '',
            'totalOrders' => 0,
            'lastVisit' => '-',
        ], 201);
    }

    public function show($id)
    {
        $customer = Customer::with('orders')->findOrFail($id);

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'whatsapp' => $customer->whatsapp ?? $customer->phone,
            'address' => $customer->address ?? '',
            'notes' => $customer->notes ?? '',
            'totalOrders' => $customer->orders->count(),
            'lastVisit' => $customer->orders->max('order_date') ? \Carbon\Carbon::parse($customer->orders->max('order_date'))->format('Y-m-d') : '-',
            'orders' => $customer->orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'invoice' => $order->order_number,
                    'service' => $order->orderItems->first()->item_name ?? 'Multiple Items',
                    'clothingType' => $order->orderItems->first()->category ?? '-',
                    'status' => $this->getStatusLabel($order->status),
                    'deadline' => $order->deadline ? \Carbon\Carbon::parse($order->deadline)->format('Y-m-d') : '-',
                    'price' => $order->total_amount,
                    'dp' => $order->down_payment,
                    'discount' => (float) $order->discount,
                    'notes' => $order->notes ?? '',
                    'createdAt' => \Carbon\Carbon::parse($order->order_date)->format('Y-m-d'),
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone,' . $id,
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer->update($request->all());

        // Create notification for customer update
        try {
            $notifService = new NotificationService();
            $notifService->customerUpdated($customer->name, $customer->id);
        } catch (\Exception $e) {
            \Log::error('Failed to create notification: ' . $e->getMessage());
        }

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'whatsapp' => $customer->whatsapp ?? $customer->phone,
            'address' => $customer->address ?? '',
            'notes' => $customer->notes ?? '',
            'totalOrders' => $customer->orders->count(),
            'lastVisit' => $customer->orders->max('order_date') ? \Carbon\Carbon::parse($customer->orders->max('order_date'))->format('Y-m-d') : '-',
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(null, 204);
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