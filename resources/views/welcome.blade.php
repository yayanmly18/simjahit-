@extends('layouts.app')

@section('title', 'Selamat Datang')

@section('content')
    <div class="text-center py-16">
        <div class="mb-8">
            <i class="fas fa-scissors text-6xl text-blue-600 mb-4"></i>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">SimJahit</h1>
            <p class="text-xl text-gray-600">Sistem Manajemen Jahit Terpercaya</p>
        </div>

        <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Kelola Pelanggan</h3>
                <p class="text-gray-600 mb-4">Daftar dan kelola data pelanggan dengan mudah</p>
                <a href="{{ route('customers.index') }}"
                    class="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Lihat Pelanggan
                </a>
            </div>

            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-clipboard-list text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Buat Pesanan</h3>
                <p class="text-gray-600 mb-4">Catat pesanan baru dengan detail lengkap</p>
                <a href="{{ route('orders.create') }}"
                    class="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    Buat Pesanan
                </a>
            </div>

            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-chart-line text-purple-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold mb-2">Dashboard</h3>
                <p class="text-gray-600 mb-4">Lihat ringkasan dan statistik bisnis</p>
                <a href="{{ route('dashboard') }}"
                    class="inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                    Buka Dashboard
                </a>
            </div>
        </div>

        <div class="mt-16 bg-white rounded-lg shadow p-8">
            <h2 class="text-2xl font-bold mb-6">Alur Kerja Sistem</h2>
            <div class="flex flex-wrap justify-center items-center gap-4">
                <div class="text-center">
                    <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-user-plus text-blue-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Pelanggan Datang</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-clipboard-list text-green-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Input Pesanan</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-print text-purple-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Cetak Nota</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-sticky-note text-yellow-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Tempel Nota</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-tools text-orange-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Pengerjaan</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-sync-alt text-indigo-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Update Status</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fab fa-whatsapp text-green-600"></i>
                    </div>
                    <p class="text-sm font-semibold">WA Otomatis</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>

                <div class="text-center">
                    <div class="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <i class="fas fa-money-bill text-red-600"></i>
                    </div>
                    <p class="text-sm font-semibold">Pembayaran</p>
                </div>
            </div>
        </div>
    </div>
@endsection