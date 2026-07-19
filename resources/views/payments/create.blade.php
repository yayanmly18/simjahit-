@extends('layouts.app')

@section('title', 'Catat Pembayaran')

@section('content')
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">
            <i class="fas fa-money-bill text-green-600"></i> Catat Pembayaran
        </h2>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="font-semibold mb-2">Informasi Pesanan</h3>
            <p class="mb-1"><strong>No. Pesanan:</strong> {{ $order->order_number }}</p>
            <p class="mb-1"><strong>Pelanggan:</strong> {{ $order->customer->name }}</p>
            <p class="mb-1"><strong>Total:</strong> Rp {{ number_format($order->total_amount, 0, ',', '.') }}</p>
            <p class="mb-1"><strong>DP:</strong> Rp {{ number_format($order->down_payment, 0, ',', '.') }}</p>
            <p class="text-red-600"><strong>Sisa:</strong> Rp {{ number_format($order->remaining_payment, 0, ',', '.') }}
            </p>
        </div>

        <form action="{{ route('payments.store', $order) }}" method="POST">
            @csrf

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Tipe Pembayaran *</label>
                <select name="type" required
                    class="w-full border rounded px-3 py-2 @error('type') border-red-500 @enderror">
                    <option value="down_payment" {{ old('type') == 'down_payment' ? 'selected' : '' }}>Down Payment (DP)
                    </option>
                    <option value="remaining_payment" {{ old('type') == 'remaining_payment' ? 'selected' : '' }}>Pembayaran
                        Sisa</option>
                    <option value="full_payment" {{ old('type') == 'full_payment' ? 'selected' : '' }}>Pembayaran Full
                    </option>
                </select>
                @error('type')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Jumlah Pembayaran *</label>
                <input type="number" name="amount" value="{{ old('amount') }}" min="0" step="1000" required
                    class="w-full border rounded px-3 py-2 @error('amount') border-red-500 @enderror" placeholder="0">
                @error('amount')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Metode Pembayaran *</label>
                <select name="payment_method" required
                    class="w-full border rounded px-3 py-2 @error('payment_method') border-red-500 @enderror">
                    <option value="cash" {{ old('payment_method') == 'cash' ? 'selected' : '' }}>Tunai</option>
                    <option value="transfer" {{ old('payment_method') == 'transfer' ? 'selected' : '' }}>Transfer Bank
                    </option>
                    <option value="ewallet" {{ old('payment_method') == 'ewallet' ? 'selected' : '' }}>E-Wallet</option>
                </select>
                @error('payment_method')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">Catatan</label>
                <textarea name="notes" rows="3"
                    class="w-full border rounded px-3 py-2 @error('notes') border-red-500 @enderror"
                    placeholder="Catatan tambahan...">{{ old('notes') }}</textarea>
                @error('notes')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex justify-between">
                <a href="{{ route('orders.show', $order) }}"
                    class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                    <i class="fas fa-arrow-left"></i> Kembali
                </a>
                <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-save"></i> Simpan Pembayaran
                </button>
            </div>
        </form>
    </div>
@endsection