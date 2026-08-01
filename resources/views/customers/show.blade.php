@extends('layouts.app')

@section('title', $customer->name)

@section('content')
    <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow mb-6">
            <div
                class="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-blue-600 text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ $customer->name }}</h2>
                        <p class="text-sm text-gray-500">Detail Pelanggan</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <a href="{{ route('customers.edit', $customer) }}"
                        class="bg-yellow-500 text-white px-5 py-2.5 rounded-lg hover:bg-yellow-600 transition text-sm font-medium inline-flex items-center gap-2">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="{{ route('orders.create') }}?customer_id={{ $customer->id }}"
                        class="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium inline-flex items-center gap-2">
                        <i class="fas fa-plus"></i> Buat Pesanan
                    </a>
                </div>
            </div>

            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Customer Info -->
                    <div class="lg:col-span-2">
                        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i class="fas fa-id-card text-blue-600"></i> Informasi Pelanggan
                        </h3>
                        <div class="bg-gray-50 rounded-xl p-5">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-user text-blue-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 font-medium">Nama Lengkap</p>
                                        <p class="text-sm font-semibold text-gray-900">{{ $customer->name }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-phone text-green-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 font-medium">No. Telepon</p>
                                        <p class="text-sm font-semibold text-gray-900">{{ $customer->phone }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fab fa-whatsapp text-emerald-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 font-medium">WhatsApp</p>
                                        <p class="text-sm font-semibold text-gray-900">{{ $customer->whatsapp ?? '-' }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-envelope text-purple-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 font-medium">Email</p>
                                        <p class="text-sm font-semibold text-gray-900">{{ $customer->email ?? '-' }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 md:col-span-2">
                                    <div
                                        class="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-map-marker-alt text-orange-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 font-medium">Alamat</p>
                                        <p class="text-sm font-semibold text-gray-900">{{ $customer->address ?? '-' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div>
                        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i class="fas fa-chart-bar text-green-600"></i> Statistik
                        </h3>
                        <div class="space-y-3">
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                                <div class="flex items-center gap-3 mb-2">
                                    <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-shopping-bag text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-blue-700 font-medium">Total Pesanan</p>
                                        <p class="text-2xl font-bold text-blue-900">{{ $customer->orders->count() }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5">
                                <div class="flex items-center gap-3 mb-2">
                                    <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-money-bill-wave text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <p class="text-xs text-green-700 font-medium">Total Pengeluaran</p>
                                        <p class="text-lg font-bold text-green-900">Rp
                                            {{ number_format($customer->orders->sum('total_amount'), 0, ',', '.') }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order History -->
                <div class="mt-8">
                    <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i class="fas fa-history text-blue-600"></i> Riwayat Pesanan
                    </h3>
                    @if($customer->orders->count() > 0)
                        <div class="bg-gray-50 rounded-xl overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="bg-gray-100 border-b border-gray-200">
                                            <th
                                                class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                No. Pesanan</th>
                                            <th
                                                class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Tanggal</th>
                                            <th
                                                class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total</th>
                                            <th
                                                class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status</th>
                                            <th
                                                class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($customer->orders as $order)
                                            <tr class="border-b border-gray-200 hover:bg-white transition">
                                                <td class="py-3 px-4 font-medium text-gray-900">{{ $order->order_number }}</td>
                                                <td class="py-3 px-4 text-gray-600">{{ $order->order_date->format('d/m/Y') }}</td>
                                                <td class="py-3 px-4 font-semibold text-gray-900">Rp
                                                    {{ number_format($order->total_amount, 0, ',', '.') }}</td>
                                                <td class="py-3 px-4">
                                                    @php
                                                        $statusClass = match ($order->status) {
                                                            'pending' => 'bg-yellow-100 text-yellow-800',
                                                            'processing' => 'bg-blue-100 text-blue-800',
                                                            'finishing' => 'bg-purple-100 text-purple-800',
                                                            'completed' => 'bg-green-100 text-green-800',
                                                            'paid' => 'bg-gray-100 text-gray-800',
                                                            'cancelled' => 'bg-red-100 text-red-800',
                                                            default => 'bg-gray-100 text-gray-800'
                                                        };
                                                        $statusLabel = match ($order->status) {
                                                            'pending' => 'Menunggu',
                                                            'processing' => 'Diproses',
                                                            'finishing' => 'Finishing',
                                                            'completed' => 'Selesai',
                                                            'paid' => 'Diambil',
                                                            'cancelled' => 'Dibatalkan',
                                                            default => $order->status
                                                        };
                                                    @endphp
                                                    <span
                                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium {{ $statusClass }}">
                                                        <span
                                                            class="w-1.5 h-1.5 rounded-full {{ $order->status === 'pending' ? 'bg-yellow-500' : ($order->status === 'processing' ? 'bg-blue-500' : ($order->status === 'finishing' ? 'bg-purple-500' : ($order->status === 'completed' ? 'bg-green-500' : ($order->status === 'paid' ? 'bg-gray-500' : ($order->status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'))))) }}"></span>
                                                        {{ $statusLabel }}
                                                    </span>
                                                </td>
                                                <td class="py-3 px-4">
                                                    <a href="{{ route('orders.show', $order) }}"
                                                        class="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1.5">
                                                        <i class="fas fa-eye"></i> Lihat
                                                    </a>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @else
                        <div class="bg-gray-50 rounded-xl p-8 text-center">
                            <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                <i class="fas fa-inbox text-gray-400 text-2xl"></i>
                            </div>
                            <p class="text-gray-500 font-medium">Belum ada pesanan</p>
                            <p class="text-gray-400 text-sm mt-1">Pesanan pelanggan ini akan muncul di sini</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection