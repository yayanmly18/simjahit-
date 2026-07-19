@extends('layouts.app')

@section('title', 'Tambah Pelanggan')

@section('content')
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">
            <i class="fas fa-user-plus text-blue-600"></i> Tambah Pelanggan Baru
        </h2>

        <form action="{{ route('customers.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Nama Lengkap *</label>
                <input type="text" name="name" value="{{ old('name') }}" required
                    class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror">
                @error('name')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">No. Telepon *</label>
                <input type="text" name="phone" value="{{ old('phone') }}" required
                    class="w-full border rounded px-3 py-2 @error('phone') border-red-500 @enderror">
                @error('phone')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">No. WhatsApp</label>
                <input type="text" name="whatsapp" value="{{ old('whatsapp') }}"
                    class="w-full border rounded px-3 py-2 @error('whatsapp') border-red-500 @enderror"
                    placeholder="Contoh: 08123456789">
                @error('whatsapp')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Alamat</label>
                <textarea name="address" rows="3"
                    class="w-full border rounded px-3 py-2 @error('address') border-red-500 @enderror">{{ old('address') }}</textarea>
                @error('address')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">Email</label>
                <input type="email" name="email" value="{{ old('email') }}"
                    class="w-full border rounded px-3 py-2 @error('email') border-red-500 @enderror">
                @error('email')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex justify-between">
                <a href="{{ route('customers.index') }}" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                    <i class="fas fa-arrow-left"></i> Kembali
                </a>
                <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    <i class="fas fa-save"></i> Simpan
                </button>
            </div>
        </form>
    </div>
@endsection