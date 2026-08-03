@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs sm:text-sm">Total Pesanan</p>
                    <p class="text-2xl sm:text-3xl font-bold text-gray-800">{{ $totalOrders }}</p>
                </div>
                <div class="bg-blue-100 rounded-full p-2 sm:p-3">
                    <i class="fas fa-clipboard-list text-blue-600 text-lg sm:text-2xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs sm:text-sm">Menunggu</p>
                    <p class="text-2xl sm:text-3xl font-bold text-yellow-600">{{ $pendingOrders }}</p>
                </div>
                <div class="bg-yellow-100 rounded-full p-2 sm:p-3">
                    <i class="fas fa-clock text-yellow-600 text-lg sm:text-2xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs sm:text-sm">Sedang Dikerjakan</p>
                    <p class="text-2xl sm:text-3xl font-bold text-blue-600">{{ $processingOrders }}</p>
                </div>
                <div class="bg-blue-100 rounded-full p-2 sm:p-3">
                    <i class="fas fa-spinner text-blue-600 text-lg sm:text-2xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs sm:text-sm">Selesai & Lunas</p>
                    <p class="text-2xl sm:text-3xl font-bold text-green-600">{{ $completedOrders + $paidOrders }}</p>
                </div>
                <div class="bg-green-100 rounded-full p-2 sm:p-3">
                    <i class="fas fa-check-circle text-green-600 text-lg sm:text-2xl"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl font-bold mb-4">
                <i class="fas fa-recent text-blue-600"></i> Pesanan Terbaru
            </h2>
            <div class="overflow-x-auto -mx-4 sm:mx-0">
                <div class="min-w-[600px] px-4 sm:px-0">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b">
                                <th class="text-left py-2 text-xs sm:text-sm">No. Pesanan</th>
                                <th class="text-left py-2 text-xs sm:text-sm">Pelanggan</th>
                                <th class="text-left py-2 text-xs sm:text-sm">Tanggal</th>
                                <th class="text-left py-2 text-xs sm:text-sm">Total</th>
                                <th class="text-left py-2 text-xs sm:text-sm">Status</th>
                                <th class="text-left py-2 text-xs sm:text-sm">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentOrders as $order)
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="py-3 text-xs sm:text-sm">{{ $order->order_number }}</td>
                                    <td class="py-3 text-xs sm:text-sm">{{ $order->customer->name }}</td>
                                    <td class="py-3 text-xs sm:text-sm">{{ $order->order_date->format('d/m/Y') }}</td>
                                    <td class="py-3 text-xs sm:text-sm">Rp
                                        {{ number_format($order->total_amount, 0, ',', '.') }}</td>
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
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="py-4 text-center text-gray-500 text-sm">
                                        Belum ada pesanan
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mt-4">
                <a href="{{ route('orders.index') }}" class="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
                    Lihat Semua Pesanan <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl font-bold mb-4">
                <i class="fas fa-chart-line text-green-600"></i> Total Pendapatan
            </h2>
            <div class="text-center py-6 sm:py-8">
                <p class="text-2xl sm:text-4xl font-bold text-green-600 break-words">
                    Rp {{ number_format($totalRevenue, 0, ',', '.') }}
                </p>
                <p class="text-gray-500 mt-2 text-sm">Total pembayaran yang diterima</p>
            </div>
            <div class="mt-6 space-y-3">
                <a href="{{ route('customers.create') }}"
                    class="block w-full bg-blue-600 text-white text-center py-2.5 sm:py-2 rounded hover:bg-blue-700 text-sm sm:text-base">
                    <i class="fas fa-user-plus"></i> Tambah Pelanggan
                </a>
                <a href="{{ route('orders.create') }}"
                    class="block w-full bg-green-600 text-white text-center py-2.5 sm:py-2 rounded hover:bg-green-700 text-sm sm:text-base">
                    <i class="fas fa-plus"></i> Buat Pesanan Baru
                </a>
            </div>
        </div>
    </div>
@endsection