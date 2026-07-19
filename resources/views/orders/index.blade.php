@extends('layouts.app')

@section('title', 'Daftar Pesanan')

@section('content')
    <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold">
                <i class="fas fa-clipboard-list text-blue-600"></i> Daftar Pesanan
            </h2>
            <a href="{{ route('orders.create') }}" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <i class="fas fa-plus"></i> Buat Pesanan
            </a>
        </div>

        <div class="p-6">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-2">No. Pesanan</th>
                            <th class="text-left py-2">Pelanggan</th>
                            <th class="text-left py-2">Tanggal</th>
                            <th class="text-left py-2">Deadline</th>
                            <th class="text-left py-2">Total</th>
                            <th class="text-left py-2">Status</th>
                            <th class="text-left py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($orders as $order)
                            <tr class="border-b hover:bg-gray-50">
                                <td class="py-3 font-semibold">{{ $order->order_number }}</td>
                                <td class="py-3">{{ $order->customer->name }}</td>
                                <td class="py-3">{{ $order->order_date->format('d/m/Y') }}</td>
                                <td class="py-3">{{ $order->deadline ? $order->deadline->format('d/m/Y') : '-' }}</td>
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
                                    <a href="{{ route('orders.show', $order) }}" class="text-blue-600 hover:text-blue-800 mr-2"
                                        title="Detail">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('orders.print', $order) }}"
                                        class="text-purple-600 hover:text-purple-800 mr-2" title="Print" target="_blank">
                                        <i class="fas fa-print"></i>
                                    </a>
                                    <form action="{{ route('orders.destroy', $order) }}" method="POST" class="inline"
                                        onsubmit="return confirm('Yakin ingin menghapus?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-800" title="Hapus">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="py-4 text-center text-gray-500">
                                    Belum ada pesanan. <a href="{{ route('orders.create') }}" class="text-blue-600">Buat pesanan
                                        pertama</a>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">
                {{ $orders->links() }}
            </div>
        </div>
    </div>
@endsection