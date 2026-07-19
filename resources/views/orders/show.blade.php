@extends('layouts.app')

@section('title', $order->order_number)

@section('content')
    <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold">
                    <i class="fas fa-clipboard-check text-blue-600"></i> Detail Pesanan
                </h2>
                <p class="text-gray-600 mt-1">No. Pesanan: <span class="font-semibold">{{ $order->order_number }}</span></p>
            </div>
            <div class="flex space-x-2">
                <a href="{{ route('orders.print', $order) }}"
                    class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" target="_blank">
                    <i class="fas fa-print"></i> Print Nota
                </a>
                <a href="{{ route('orders.edit', $order) }}"
                    class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                    <i class="fas fa-edit"></i> Edit
                </a>
            </div>
        </div>

        <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4">Informasi Pelanggan</h3>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="mb-2"><strong>Nama:</strong> {{ $order->customer->name }}</p>
                            <p class="mb-2"><strong>No. Telepon:</strong> {{ $order->customer->phone }}</p>
                            <p class="mb-2"><strong>WhatsApp:</strong>
                                {{ $order->customer->whatsapp ?? $order->customer->phone }}</p>
                            <p><strong>Alamat:</strong> {{ $order->customer->address ?? '-' }}</p>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4">Detail Item</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full border">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="border px-4 py-2 text-left">Item</th>
                                        <th class="border px-4 py-2 text-left">Kategori</th>
                                        <th class="border px-4 py-2 text-center">Qty</th>
                                        <th class="border px-4 py-2 text-right">Harga</th>
                                        <th class="border px-4 py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($order->orderItems as $item)
                                        <tr>
                                            <td class="border px-4 py-2">
                                                <strong>{{ $item->item_name }}</strong>
                                                @if($item->color)
                                                    <br><small class="text-gray-600">Warna: {{ $item->color }}</small>
                                                @endif
                                                @if($item->size)
                                                    <br><small class="text-gray-600">Ukuran: {{ $item->size }}</small>
                                                @endif
                                            </td>
                                            <td class="border px-4 py-2">{{ $item->category ?? '-' }}</td>
                                            <td class="border px-4 py-2 text-center">{{ $item->quantity }}</td>
                                            <td class="border px-4 py-2 text-right">Rp
                                                {{ number_format($item->price, 0, ',', '.') }}</td>
                                            <td class="border px-4 py-2 text-right font-semibold">Rp
                                                {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4">Update Status</h3>
                        <form action="{{ route('orders.update-status', $order) }}" method="POST"
                            class="flex items-center space-x-4">
                            @csrf
                            <select name="status"
                                class="border rounded px-4 py-2 @error('status') border-red-500 @enderror">
                                <option value="pending" {{ $order->status == 'pending' ? 'selected' : '' }}>Menunggu</option>
                                <option value="processing" {{ $order->status == 'processing' ? 'selected' : '' }}>Sedang
                                    Dikerjakan</option>
                                <option value="completed" {{ $order->status == 'completed' ? 'selected' : '' }}>Selesai
                                </option>
                                <option value="paid" {{ $order->status == 'paid' ? 'selected' : '' }}>Lunas</option>
                                <option value="cancelled" {{ $order->status == 'cancelled' ? 'selected' : '' }}>Dibatalkan
                                </option>
                            </select>
                            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                                <i class="fas fa-save"></i> Update Status
                            </button>
                        </form>
                    </div>
                </div>

                <div>
                    <div class="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Ringkasan Pembayaran</h3>
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span>Total:</span>
                                <span class="font-bold">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>DP:</span>
                                <span class="font-bold">Rp {{ number_format($order->down_payment, 0, ',', '.') }}</span>
                            </div>
                            <div class="flex justify-between text-red-600">
                                <span>Sisa:</span>
                                <span class="font-bold">Rp
                                    {{ number_format($order->remaining_payment, 0, ',', '.') }}</span>
                            </div>
                        </div>

                        <div class="border-t pt-4">
                            <p class="text-sm text-gray-600 mb-2">Status:
                                @php
                                    $statusClass = match ($order->status) {
                                        'pending' => 'bg-yellow-100 text-yellow-800',
                                        'processing' => 'bg-blue-100 text-blue-800',
                                        'completed' => 'bg-green-100 text-green-800',
                                        'paid' => 'bg-green-100 text-green-800',
                                        'cancelled' => 'bg-red-100 text-red-800',
                                        default => 'bg-gray-100 text-gray-800'
                                    };
                                @endphp
                                <span class="px-2 py-1 rounded text-xs {{ $statusClass }}">
                                    {{ ucfirst($order->status) }}
                                </span>
                            </p>
                        </div>

                        <div class="mt-4 space-y-2">
                            <a href="{{ route('payments.create', $order) }}"
                                class="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700">
                                <i class="fas fa-money-bill"></i> Catat Pembayaran
                            </a>
                            <a href="{{ route('payments.index', $order) }}"
                                class="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">
                                <i class="fas fa-history"></i> Riwayat Pembayaran
                            </a>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 class="text-lg font-semibold mb-4">Informasi Pesanan</h3>
                        <div class="space-y-2 text-sm">
                            <p><strong>Tanggal Pesan:</strong> {{ $order->order_date->format('d/m/Y') }}</p>
                            <p><strong>Deadline:</strong> {{ $order->deadline ? $order->deadline->format('d/m/Y') : '-' }}
                            </p>
                            <p><strong>Dibuat:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
                            @if($order->notes)
                                <p><strong>Catatan:</strong> {{ $order->notes }}</p>
                            @endif
                        </div>
                    </div>

                    <div class="bg-green-50 rounded-lg p-6">
                        <h3 class="text-lg font-semibold mb-4">WhatsApp</h3>
                        <div class="space-y-2">
                            <form action="{{ route('orders.send-wa', $order) }}" method="POST" class="w-full">
                                @csrf
                                <button type="submit"
                                    class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                                    <i class="fab fa-whatsapp"></i> Kirim Notifikasi WA
                                </button>
                            </form>
                            @if($order->remaining_payment > 0)
                                <form action="{{ route('orders.send-reminder', $order) }}" method="POST" class="w-full">
                                    @csrf
                                    <button type="submit"
                                        class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                                        <i class="fas fa-bell"></i> Kirim Pengingat Pembayaran
                                    </button>
                                </form>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection