@extends('layouts.app')

@section('title', 'Buat Pesanan')

@section('content')
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">
            <i class="fas fa-plus-circle text-green-600"></i> Buat Pesanan Baru
        </h2>

        <form action="{{ route('orders.store') }}" method="POST" id="orderForm">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Pelanggan *</label>
                    <select name="customer_id" required
                        class="w-full border rounded px-3 py-2 @error('customer_id') border-red-500 @enderror">
                        <option value="">-- Pilih Pelanggan --</option>
                        @foreach($customers as $customer)
                            <option value="{{ $customer->id }}" {{ old('customer_id', request('customer_id')) == $customer->id ? 'selected' : '' }}>
                                {{ $customer->name }} - {{ $customer->phone }}
                            </option>
                        @endforeach
                    </select>
                    @error('customer_id')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Tanggal Pesan *</label>
                    <input type="date" name="order_date" value="{{ old('order_date', date('Y-m-d')) }}" required
                        class="w-full border rounded px-3 py-2 @error('order_date') border-red-500 @enderror">
                    @error('order_date')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-gray-700 font-semibold mb-2">Deadline</label>
                    <input type="date" name="deadline" value="{{ old('deadline') }}"
                        class="w-full border rounded px-3 py-2 @error('deadline') border-red-500 @enderror">
                    @error('deadline')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label class="block text-gray-700 font-semibold mb-2">DP (Down Payment)</label>
                    <input type="number" name="down_payment" value="{{ old('down_payment', 0) }}" min="0" step="1000"
                        class="w-full border rounded px-3 py-2 @error('down_payment') border-red-500 @enderror"
                        placeholder="0">
                    @error('down_payment')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">Catatan</label>
                <textarea name="notes" rows="2"
                    class="w-full border rounded px-3 py-2 @error('notes') border-red-500 @enderror"
                    placeholder="Catatan tambahan...">{{ old('notes') }}</textarea>
                @error('notes')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Item Pesanan</h3>
                    <button type="button" onclick="addItem()"
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-plus"></i> Tambah Item
                    </button>
                </div>

                <div id="itemsContainer">
                    <!-- Items will be added here -->
                </div>

                @error('items')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span id="totalAmount">Rp 0</span>
                </div>
            </div>

            <div class="flex justify-between">
                <a href="{{ route('orders.index') }}" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                    <i class="fas fa-arrow-left"></i> Kembali
                </a>
                <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-save"></i> Simpan Pesanan
                </button>
            </div>
        </form>
    </div>

    <script>
        let itemCount = 0;

        function addItem() {
            itemCount++;
            const container = document.getElementById('itemsContainer');
            const itemHtml = `
            <div class="item-row border rounded p-4 mb-4 bg-gray-50" data-item="${itemCount}">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Nama Item *</label>
                        <input type="text" name="items[${itemCount}][item_name]" required
                            class="w-full border rounded px-3 py-2 item-name" placeholder="Contoh: Kemeja">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Kategori</label>
                        <input type="text" name="items[${itemCount}][category]"
                            class="w-full border rounded px-3 py-2" placeholder="Baju, Celana, Jas, dll">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Jenis Kain</label>
                        <input type="text" name="items[${itemCount}][fabric_type]"
                            class="w-full border rounded px-3 py-2" placeholder="Katun, Sutra, dll">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Warna</label>
                        <input type="text" name="items[${itemCount}][color]"
                            class="w-full border rounded px-3 py-2" placeholder="Warna">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Ukuran</label>
                        <input type="text" name="items[${itemCount}][size]"
                            class="w-full border rounded px-3 py-2" placeholder="S, M, L, XL">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Jumlah *</label>
                        <input type="number" name="items[${itemCount}][quantity]" value="1" min="1" required
                            class="w-full border rounded px-3 py-2 item-quantity">
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">Harga *</label>
                        <input type="number" name="items[${itemCount}][price]" min="0" step="1000" required
                            class="w-full border rounded px-3 py-2 item-price" placeholder="0">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">Deskripsi</label>
                    <textarea name="items[${itemCount}][description]" rows="2"
                        class="w-full border rounded px-3 py-2" placeholder="Deskripsi item..."></textarea>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">Catatan</label>
                    <input type="text" name="items[${itemCount}][notes]"
                        class="w-full border rounded px-3 py-2" placeholder="Catatan khusus...">
                </div>

                <div class="flex justify-between items-center">
                    <div class="text-lg font-bold">
                        Subtotal: <span class="item-subtotal">Rp 0</span>
                    </div>
                    <button type="button" onclick="removeItem(this)" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
            container.insertAdjacentHTML('beforeend', itemHtml);

            // Add event listeners to calculate subtotal
            const newItem = container.lastElementChild;
            newItem.querySelector('.item-quantity').addEventListener('input', calculateTotal);
            newItem.querySelector('.item-price').addEventListener('input', calculateTotal);

            calculateTotal();
        }

        function removeItem(button) {
            const itemRow = button.closest('.item-row');
            itemRow.remove();
            calculateTotal();
        }

        function calculateTotal() {
            let total = 0;
            document.querySelectorAll('.item-row').forEach(row => {
                const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const subtotal = quantity * price;
                row.querySelector('.item-subtotal').textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
                total += subtotal;
            });
            document.getElementById('totalAmount').textContent = 'Rp ' + total.toLocaleString('id-ID');
        }

        // Add first item on load
        addItem();
    </script>
@endsection