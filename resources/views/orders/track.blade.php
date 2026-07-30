<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lacak Pesanan - {{ $settings['store_name'] ?? 'A.Y.A Tailor' }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }

        .status-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: .7;
            }
        }
    </style>
</head>

<body class="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
        <!-- Header -->
        <div class="text-center mb-8 fade-in">
        <div class="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-2xl shadow-lg">
                <img src="{{ asset('logo.png') }}" alt="{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}"
                    class="w-full h-full object-contain" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}</h1>
            <p class="text-gray-600">Jasa Jahit & Permak Pakaian</p>
        </div>

        <!-- Order Info Card -->
        <div class="bg-white rounded-3xl shadow-xl p-8 mb-6 fade-in" style="animation-delay: 0.1s;">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <p class="text-sm text-gray-500 mb-1">Nomor Invoice</p>
                    <p class="text-2xl font-bold text-blue-600">{{ $order->order_number }}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500 mb-1">Tanggal Pesanan</p>
                    <p class="text-sm font-semibold text-gray-900">
                        {{ \Carbon\Carbon::parse($order->order_date)->format('d M Y') }}</p>
                </div>
            </div>

            <!-- Status -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <p class="text-sm text-gray-600 mb-2">Status Pesanan</p>
                <div class="flex items-center gap-3">
                    @php
                        $statusColors = [
                            'pending' => 'bg-amber-500',
                            'processing' => 'bg-blue-500',
                            'finishing' => 'bg-purple-500',
                            'completed' => 'bg-green-500',
                            'paid' => 'bg-slate-500',
                            'cancelled' => 'bg-red-500',
                        ];
                        $statusTextColors = [
                            'pending' => 'text-amber-700',
                            'processing' => 'text-blue-700',
                            'finishing' => 'text-purple-700',
                            'completed' => 'text-green-700',
                            'paid' => 'text-slate-700',
                            'cancelled' => 'text-red-700',
                        ];
                        $statusLabels = [
                            'pending' => 'Menunggu',
                            'processing' => 'Diproses',
                            'finishing' => 'Finishing',
                            'completed' => 'Selesai',
                            'paid' => 'Sudah Diambil',
                            'cancelled' => 'Dibatalkan',
                        ];
                        $status = $statusLabels[$order->status] ?? $order->status;
                        $colorClass = $statusColors[$order->status] ?? 'bg-gray-500';
                        $textColor = $statusTextColors[$order->status] ?? 'text-gray-700';
                    @endphp
                    <div class="w-4 h-4 rounded-full {{ $colorClass }} status-pulse"></div>
                    <p class="text-xl font-bold {{ $textColor }}">{{ $status }}</p>
                </div>
            </div>

            <!-- Customer Info -->
            <div class="mb-6">
                <h3 class="text-sm font-bold text-gray-900 mb-3">Informasi Pelanggan</h3>
                <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <p class="text-sm text-gray-700">{{ $order->customer->name }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                            </path>
                        </svg>
                        <p class="text-sm text-gray-700">{{ $order->customer->phone }}</p>
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="mb-6">
                <h3 class="text-sm font-bold text-gray-900 mb-3">Detail Pesanan</h3>
                <div class="space-y-3">
                    @foreach($order->orderItems as $item)
                        <div class="bg-gray-50 rounded-xl p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-900">{{ $item->item_name }}</p>
                                    <p class="text-xs text-gray-500 mt-1">{{ $item->category }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-bold text-gray-900">{{ $item->quantity }} pcs</p>
                                </div>
                            </div>
                            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span class="text-xs text-gray-500">Harga Satuan</span>
                                <span class="text-sm font-semibold text-gray-700">Rp
                                    {{ number_format($item->price, 0, ',', '.') }}</span>
                            </div>
                            <div class="flex justify-between items-center mt-1">
                                <span class="text-xs text-gray-500">Subtotal</span>
                                <span class="text-sm font-bold text-blue-600">Rp
                                    {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</span>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Payment Info -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
                <h3 class="text-sm font-bold text-gray-900 mb-3">Rincian Pembayaran</h3>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Total</span>
                        <span class="font-semibold">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</span>
                    </div>
                    @if($order->discount > 0)
                        <div class="flex justify-between text-sm text-red-600">
                            <span>Diskon</span>
                            <span>-Rp {{ number_format($order->discount, 0, ',', '.') }}</span>
                        </div>
                    @endif
                    <div class="flex justify-between text-sm text-green-600">
                        <span>DP Dibayar</span>
                        <span class="font-semibold">Rp {{ number_format($order->down_payment, 0, ',', '.') }}</span>
                    </div>
                    @php
                        $remaining = $order->total_amount - $order->discount - $order->down_payment;
                    @endphp
                    @if($remaining > 0)
                        <div class="flex justify-between text-sm font-bold text-red-600 pt-2 border-t border-green-200">
                            <span>Sisa Pembayaran</span>
                            <span>Rp {{ number_format($remaining, 0, ',', '.') }}</span>
                        </div>
                    @else
                        <div class="flex justify-between text-sm font-bold text-green-700 pt-2 border-t border-green-200">
                            <span>Status</span>
                            <span>LUNAS</span>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Deadline Info -->
        @if($order->deadline)
            <div class="bg-white rounded-2xl shadow-lg p-6 mb-6 fade-in" style="animation-delay: 0.2s;">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Deadline</p>
                        <p class="text-lg font-bold text-gray-900">
                            {{ \Carbon\Carbon::parse($order->deadline)->format('d M Y') }}</p>
                    </div>
                </div>
            </div>
        @endif

        <!-- Footer -->
        <div class="text-center fade-in" style="animation-delay: 0.3s;">
            <div class="w-16 h-16 mx-auto mb-3 overflow-hidden rounded-xl">
                <img src="{{ asset('logo.png') }}" alt="{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}"
                    class="w-full h-full object-contain" />
            </div>
            <p class="text-sm text-gray-600 mb-1">{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}</p>
            <p class="text-xs text-gray-500">{{ $settings['address'] ?? 'Jl. Sudirman No. 45, Bandung' }}</p>
            <p class="text-xs text-gray-500">Telp: {{ $settings['phone'] ?? '022-1234567' }}</p>
            <p class="text-xs text-gray-400 mt-4">© {{ date('Y') }} A.Y.A Tailor. All rights reserved.</p>
        </div>
    </div>
</body>

</html>