@extends('layouts.app')

@section('title', $customer->name)

@section('content')
    <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold">
                <i class="fas fa-user text-blue-600"></i> Detail Pelanggan
            </h2>
            <div class="space-x-2">
                <a href="{{ route('customers.edit', $customer) }}"
                    class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                    <i class="fas fa-edit"></i> Edit
                </a>
                <a href="{{ route('orders.create') }}?customer_id={{ $customer->id }}"
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-plus"></i> Buat Pesanan
                </a>
            </div>
        </div>

        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Informasi Pelanggan</h3>
                    <table class="w-full">
                        <tr class="border-b">
                            <td class="py-2 font-semibold w-1/3">Nama</td>
                            <td class="py-2">{{ $customer->name }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 font-semibold">No. Telepon</td>
                            <td class="py-2">{{ $customer->phone }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 font-semibold">WhatsApp</td>
                            <td class="py-2">{{ $customer->whatsapp ?? '-' }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 font-semibold">Alamat</td>
                            <td class="py-2">{{ $customer->address ?? '-' }}</td>
                        </tr>
                        <tr class="border-b">
                            <td class="py-2 font-semibold">Email</td>
                            <td class="py-2">{{ $customer->email ?? '-' }}</td>
                        </tr>
                    </table>
                </div>

                <div>
                    <h3 class="text-lg font-semibold mb-4">Statistik</h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-gray-600">Total Pesanan:</span>
                            <span class="font-bold text-xl">{{ $customer->orders->count() }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Total Pengeluaran:</span>
                            <span class="font-bold text-xl text-green-600">
                                Rp {{ number_format($customer->orders->sum('total_amount'), 0, ',', '.') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-lg font-semibold mb-4">Riwayat Pesanan</h3>
                @if($customer->orders->count() > 0)
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-2">No. Pesanan</th>
                                    <th class="text-left py-2">Tanggal</th>
                                    <th class="text-left py-2">Total</th>
                                    <th class="text-left py-2">Status</th>
                                    <th class="text-left py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($customer->orders as $order)
                                    <tr class="border-b hover:bg-gray-50">
                                        <td class="py-3">{{ $order->order_number }}</td>
                                        <td class="py-3">{{ $order->order_date->format('d/m/Y') }}</td>
                                        <td class="py-3">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</td>
                                        <td class="py-3">
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
                                        </td>
                                        <td class="py-3">
                                            <a href="{{ route('orders.show', $order) }}" class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-eye"></i> Lihat
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-gray-500 text-center py-4">Belum ada pesanan</p>
                @endif
            </div>
        </div>
    </div>
@endsection