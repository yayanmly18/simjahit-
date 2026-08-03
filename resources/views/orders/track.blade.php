@php $hideNav = true; @endphp

@extends('layouts.app')

@section('title', 'Lacak Pesanan - ' . ($settings['store_name'] ?? 'A.Y.A Tailor'))

@section('content')
    <div class="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <!-- Header Row -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 fade-in gap-4">
            <div class="flex items-center gap-3 sm:gap-4">
                <div class="w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-[10px] border border-[#2a2a2a] flex-shrink-0">
                    <img src="{{ asset('logo.png') }}" alt="{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}"
                        class="w-full h-full object-contain p-1" />
                </div>
                <div class="min-w-0">
                    <h1 class="text-xl sm:text-[28px] font-bold text-white break-words" style="letter-spacing: -1px;">
                        {{ $settings['store_name'] ?? 'A.Y.A Tailor' }}
                    </h1>
                    <p class="text-[#888888] text-xs sm:text-sm">Jasa Jahit & Permak Pakaian</p>
                </div>
            </div>
            <div class="text-right hidden sm:block">
                <p class="text-[#888888] text-[13px] font-medium uppercase tracking-wider">Nomor Invoice</p>
                <p class="text-xl font-bold text-[#faff69]">{{ $order->order_number }}</p>
            </div>
        </div>

        <!-- Main Grid: 2 columns on desktop -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 fade-in" style="animation-delay: 0.1s;">
            <!-- Left Column (2/3) -->
            <div class="lg:col-span-2 space-y-4 sm:space-y-6">
                <!-- Status + Invoice Row -->
                <div class="bg-[#1a1a1a] rounded-[12px] p-4 sm:p-6 border border-[#2a2a2a]">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                            @php
                                $statusColors = [
                                    'pending' => 'bg-[#faff69]',
                                    'processing' => 'bg-[#3b82f6]',
                                    'finishing' => 'bg-[#a855f7]',
                                    'completed' => 'bg-[#22c55e]',
                                    'paid' => 'bg-[#888888]',
                                    'cancelled' => 'bg-[#ef4444]',
                                ];
                                $statusTextColors = [
                                    'pending' => 'text-[#faff69]',
                                    'processing' => 'text-[#3b82f6]',
                                    'finishing' => 'text-[#a855f7]',
                                    'completed' => 'text-[#22c55e]',
                                    'paid' => 'text-[#888888]',
                                    'cancelled' => 'text-[#ef4444]',
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
                                $colorClass = $statusColors[$order->status] ?? 'bg-[#888888]';
                                $textColor = $statusTextColors[$order->status] ?? 'text-[#cccccc]';
                            @endphp
                            <div class="w-3 h-3 rounded-full {{ $colorClass }} status-pulse flex-shrink-0"></div>
                            <p class="text-base sm:text-lg font-bold {{ $textColor }} break-words">{{ $status }}</p>
                        </div>
                        <div class="text-right sm:hidden flex-shrink-0">
                            <p class="text-[#888888] text-[11px] font-medium uppercase tracking-wider">Invoice</p>
                            <p class="text-sm font-bold text-[#faff69]">{{ $order->order_number }}</p>
                        </div>
                        <div class="hidden sm:block text-right flex-shrink-0">
                            <p class="text-[#888888] text-[13px] font-medium uppercase tracking-wider">Tanggal</p>
                            <p class="text-sm font-semibold text-white">
                                {{ \Carbon\Carbon::parse($order->order_date)->format('d M Y') }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Customer Info -->
                <div class="bg-[#1a1a1a] rounded-[12px] p-4 sm:p-6 border border-[#2a2a2a]">
                    <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                        Informasi Pelanggan
                    </h3>
                    <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <p class="text-sm text-[#cccccc] break-words">{{ $order->customer->name }}</p>
                        </div>
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <p class="text-sm text-[#cccccc] break-words">{{ $order->customer->phone }}</p>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="bg-[#1a1a1a] rounded-[12px] p-4 sm:p-6 border border-[#2a2a2a]">
                    <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                        Detail Pesanan
                    </h3>
                    <div class="space-y-3">
                        @foreach($order->orderItems as $item)
                            <div class="bg-[#121212] rounded-[10px] p-3 sm:p-4 border border-[#2a2a2a]">
                                <div class="flex justify-between items-start mb-3 gap-3">
                                    <div class="flex-1 min-w-0">
                                        <p class="font-semibold text-white text-sm sm:text-base break-words">
                                            {{ $item->item_name }}</p>
                                        <p class="text-xs text-[#888888] mt-1">{{ $item->category }}</p>
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        <p class="text-sm font-bold text-white">{{ $item->quantity }} pcs</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
                                    <span class="text-xs text-[#888888]">Harga Satuan</span>
                                    <span class="text-sm font-semibold text-[#cccccc]">Rp
                                        {{ number_format($item->price, 0, ',', '.') }}</span>
                                </div>
                                <div class="flex items-center justify-between mt-1">
                                    <span class="text-xs text-[#888888]">Subtotal</span>
                                    <span class="text-sm font-bold text-[#faff69]">Rp
                                        {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Right Column (1/3) -->
            <div class="space-y-4 sm:space-y-6">
                <!-- Payment Info -->
                <div class="bg-[#1a1a1a] rounded-[12px] p-4 sm:p-6 border border-[#2a2a2a]">
                    <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                        Rincian Pembayaran
                    </h3>
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm gap-3">
                            <span class="text-[#888888]">Total</span>
                            <span class="font-semibold text-white text-right">Rp
                                {{ number_format($order->total_amount, 0, ',', '.') }}</span>
                        </div>
                        @if($order->discount > 0)
                            <div class="flex justify-between text-sm gap-3">
                                <span class="text-[#ef4444]">Diskon</span>
                                <span class="font-semibold text-[#ef4444] text-right">-Rp
                                    {{ number_format($order->discount, 0, ',', '.') }}</span>
                            </div>
                        @endif
                        <div class="flex justify-between text-sm gap-3">
                            <span class="text-[#22c55e]">DP Dibayar</span>
                            <span class="font-semibold text-[#22c55e] text-right">Rp
                                {{ number_format($order->down_payment, 0, ',', '.') }}</span>
                        </div>
                        @php
                            $remaining = $order->total_amount - $order->discount - $order->down_payment;
                        @endphp
                        @if($remaining > 0)
                            <div class="flex justify-between text-sm font-bold pt-3 border-t border-[#2a2a2a] gap-3">
                                <span class="text-[#faff69]">Sisa Pembayaran</span>
                                <span class="text-[#faff69] text-right">Rp {{ number_format($remaining, 0, ',', '.') }}</span>
                            </div>
                        @else
                            <div class="flex justify-between text-sm font-bold pt-3 border-t border-[#2a2a2a] gap-3">
                                <span class="text-[#22c55e]">Status</span>
                                <span class="text-[#22c55e]">LUNAS</span>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Deadline -->
                @if($order->deadline)
                    <div class="bg-[#1a1a1a] rounded-[12px] p-4 sm:p-6 border border-[#2a2a2a]">
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div
                                class="w-10 h-10 sm:w-12 sm:h-12 bg-[#242424] rounded-[10px] flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-[#faff69]" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-[13px] text-[#888888] font-medium uppercase tracking-wider">Deadline</p>
                                <p class="text-base font-bold text-white break-words">
                                    {{ \Carbon\Carbon::parse($order->deadline)->format('d M Y') }}
                                </p>
                            </div>
                        </div>
                    </div>
                @endif

                <!-- Quick Info -->
                <div class="bg-[#1a1a1a] rounded-[12px] p-4 sm:p-6 border border-[#2a2a2a]">
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm gap-3">
                            <span class="text-[#888888]">Tanggal</span>
                            <span
                                class="text-white font-medium text-right">{{ \Carbon\Carbon::parse($order->order_date)->format('d M Y') }}</span>
                        </div>
                        <div class="flex justify-between text-sm gap-3">
                            <span class="text-[#888888]">Jumlah Item</span>
                            <span class="text-white font-medium">{{ $order->orderItems->count() }} item</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center fade-in pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-[#2a2a2a]" style="animation-delay: 0.3s;">
            <div class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 overflow-hidden rounded-[10px] border border-[#2a2a2a]">
                <img src="{{ asset('logo.png') }}" alt="{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}"
                    class="w-full h-full object-contain p-1" />
            </div>
            <p class="text-sm text-[#cccccc] mb-1">{{ $settings['store_name'] ?? 'A.Y.A Tailor' }}</p>
            <p class="text-xs text-[#888888] break-words px-4">{{ $settings['address'] ?? 'Jl. Sudirman No. 45, Bandung' }}
            </p>
            <p class="text-xs text-[#888888]">Telp: {{ $settings['phone'] ?? '022-1234567' }}</p>
            <p class="text-xs text-[#5a5a5a] mt-6">© {{ date('Y') }} A.Y.A Tailor. All rights reserved.</p>
        </div>
    </div>
@endsection

@section('styles')
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a0a0a !important;
        }

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
@endsection