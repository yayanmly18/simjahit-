@extends('layouts.app')

@section('title', 'Riwayat Pembayaran')

@section('content')
    <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold">
                    <i class="fas fa-history text-blue-600"></i> Riwayat Pembayaran
                </h2>
                <p class="text-gray-600 mt-1">No. Pesanan: <span class="font-semibold">{{ $order->order_number }}</span></p>
            </div>
            <a href="{{ route('payments.create', $order) }}"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <i class="fas fa-plus"></i> Catat Pembayaran
            </a>
        </div>

        <div class="p-6">
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-gray-600">Total Pesanan</p>
                        <p class="text-xl font-bold">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Total Dibayar</p>
                        <p class="text-xl font-bold text-green-600">Rp
                            {{ number_format($payments->sum('amount'), 0, ',', '.') }}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Sisa Pembayaran</p>
                        <p class="text-xl font-bold text-red-600">Rp
                            {{ number_format($order->remaining_payment, 0, ',', '.') }}</p>
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-2">Tanggal</th>
                            <th class="text-left py-2">Tipe</th>
                            <th class="text-left py-2">Metode</th>
                            <th class="text-right py-2">Jumlah</th>
                            <th class="text-left py-2">Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payments as $payment)
                            <tr class="border-b hover:bg-gray-50">
                                <td class="py-3">{{ $payment->payment_date->format('d/m/Y H:i') }}</td>
                                <td class="py-3">
                                    @php
                                        $typeLabel = match ($payment->type) {
                                            'down_payment' => 'Down Payment',
                                            'remaining_payment' => 'Pembayaran Sisa',
                                            'full_payment' => 'Pembayaran Full',
                                            default => $payment->type
                                        };
                                    @endphp
                                    {{ $typeLabel }}
                                </td>
                                <td class="py-3">
                                    @php
                                        $methodLabel = match ($payment->payment_method) {
                                            'cash' => 'Tunai',
                                            'transfer' => 'Transfer Bank',
                                            'ewallet' => 'E-Wallet',
                                            default => $payment->payment_method
                                        };
                                    @endphp
                                    {{ $methodLabel }}
                                </td>
                                <td class="py-3 text-right font-semibold text-green-600">
                                    Rp {{ number_format($payment->amount, 0, ',', '.') }}
                                </td>
                                <td class="py-3">{{ $payment->notes ?? '-' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-4 text-center text-gray-500">
                                    Belum ada pembayaran
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-6">
                <a href="{{ route('orders.show', $order) }}"
                    class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                    <i class="fas fa-arrow-left"></i> Kembali ke Detail Pesanan
                </a>
            </div>
        </div>
    </div>
@endsection