@extends('layouts.app')

@section('title', 'Tambah Pelanggan')

@section('content')
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-4 sm:p-8">
        <h2 class="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
            <i class="fas fa-user-plus text-blue-600"></i> Tambah Pelanggan Baru
        </h2>

        <form action="{{ route('customers.store') }}" method="POST">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div class="mb-2">
                    <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-[15px]">Nama Lengkap *</label>
                    <input type="text" name="name" value="{{ old('name') }}" required
                        class="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] focus:border-blue-500 focus:outline-none @error('name') border-red-500 @enderror"
                        placeholder="Masukkan nama lengkap">
                    @error('name')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-2">
                    <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-[15px]">No. Telepon *</label>
                    <input type="text" name="phone" value="{{ old('phone') }}" required
                        class="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] focus:border-blue-500 focus:outline-none @error('phone') border-red-500 @enderror"
                        placeholder="Contoh: 08123456789">
                    @error('phone')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-2">
                    <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-[15px]">No. WhatsApp</label>
                    <input type="text" name="whatsapp" value="{{ old('whatsapp') }}"
                        class="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] focus:border-blue-500 focus:outline-none @error('whatsapp') border-red-500 @enderror"
                        placeholder="Contoh: 08123456789">
                    @error('whatsapp')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-2">
                    <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-[15px]">Email</label>
                    <input type="email" name="email" value="{{ old('email') }}"
                        class="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] focus:border-blue-500 focus:outline-none @error('email') border-red-500 @enderror"
                        placeholder="contoh@email.com">
                    @error('email')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="mb-6 mt-2">
                <label class="block text-gray-700 font-semibold mb-2 text-sm sm:text-[15px]">Alamat</label>
                <textarea name="address" rows="3"
                    class="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] focus:border-blue-500 focus:outline-none @error('address') border-red-500 @enderror"
                    placeholder="Masukkan alamat lengkap">{{ old('address') }}</textarea>
                @error('address')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div
                class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200">
                <a href="{{ route('customers.index') }}"
                    class="bg-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-600 transition text-center text-sm sm:text-base">
                    <i class="fas fa-arrow-left"></i> Kembali
                </a>
                <button type="submit"
                    class="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base">
                    <i class="fas fa-save"></i> Simpan
                </button>
            </div>
        </form>
    </div>
@endsection