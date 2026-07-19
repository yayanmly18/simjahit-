@extends('layouts.app')

@section('title', 'Daftar Pelanggan')

@section('content')
    <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-2xl font-bold">
                <i class="fas fa-users text-blue-600"></i> Daftar Pelanggan
            </h2>
            <a href="{{ route('customers.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <i class="fas fa-plus"></i> Tambah Pelanggan
            </a>
        </div>

        <div class="p-6">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-2">Nama</th>
                            <th class="text-left py-2">No. Telepon</th>
                            <th class="text-left py-2">WhatsApp</th>
                            <th class="text-left py-2">Alamat</th>
                            <th class="text-left py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($customers as $customer)
                            <tr class="border-b hover:bg-gray-50">
                                <td class="py-3 font-semibold">{{ $customer->name }}</td>
                                <td class="py-3">{{ $customer->phone }}</td>
                                <td class="py-3">{{ $customer->whatsapp ?? '-' }}</td>
                                <td class="py-3">{{ Str::limit($customer->address, 30) ?? '-' }}</td>
                                <td class="py-3">
                                    <a href="{{ route('customers.show', $customer) }}"
                                        class="text-blue-600 hover:text-blue-800 mr-2">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('customers.edit', $customer) }}"
                                        class="text-yellow-600 hover:text-yellow-800 mr-2">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ route('customers.destroy', $customer) }}" method="POST" class="inline"
                                        onsubmit="return confirm('Yakin ingin menghapus?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-800">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-4 text-center text-gray-500">
                                    Belum ada pelanggan. <a href="{{ route('customers.create') }}" class="text-blue-600">Tambah
                                        pelanggan pertama</a>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-4">
                {{ $customers->links() }}
            </div>
        </div>
    </div>
@endsection