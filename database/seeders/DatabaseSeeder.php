<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Service;
use App\Models\Expense;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create 1 admin user (login: admin@simjahit.com / admin123)
        \App\Models\User::create([
            'name' => 'Admin',
            'email' => 'admin@simjahit.com',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
        ]);

        // Create sample customers
        $customer1 = Customer::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'whatsapp' => '081234567890',
            'address' => 'Jl. Merdeka No. 123, Jakarta',
            'email' => 'budi@example.com',
        ]);

        $customer2 = Customer::create([
            'name' => 'Siti Nurhaliza',
            'phone' => '087765432100',
            'whatsapp' => '087765432100',
            'address' => 'Jl. Sudirman No. 456, Jakarta',
            'email' => 'siti@example.com',
        ]);

        $customer3 = Customer::create([
            'name' => 'Ahmad Wijaya',
            'phone' => '089912345678',
            'whatsapp' => '089912345678',
            'address' => 'Jl. Gatot Subroto No. 789, Jakarta',
            'email' => 'ahmad@example.com',
        ]);

        // Create services
        $services = [
            ['name' => 'Pendekkan Celana', 'price' => 35000, 'estimated_days' => 2, 'status' => 'Aktif'],
            ['name' => 'Pendekkan Rok', 'price' => 30000, 'estimated_days' => 2, 'status' => 'Aktif'],
            ['name' => 'Kecilkan Baju', 'price' => 50000, 'estimated_days' => 3, 'status' => 'Aktif'],
            ['name' => 'Ganti Resleting', 'price' => 45000, 'estimated_days' => 1, 'status' => 'Aktif'],
            ['name' => 'Ganti Kancing', 'price' => 15000, 'estimated_days' => 1, 'status' => 'Aktif'],
            ['name' => 'Tambal Sobek', 'price' => 25000, 'estimated_days' => 1, 'status' => 'Aktif'],
            ['name' => 'Obras', 'price' => 20000, 'estimated_days' => 1, 'status' => 'Aktif'],
            ['name' => 'Permak Jas', 'price' => 150000, 'estimated_days' => 5, 'status' => 'Aktif'],
            ['name' => 'Kecilkan Celana', 'price' => 45000, 'estimated_days' => 2, 'status' => 'Aktif'],
            ['name' => 'Pasang Furing', 'price' => 80000, 'estimated_days' => 3, 'status' => 'Nonaktif'],
        ];
        foreach ($services as $s) {
            Service::create($s);
        }

        // Create sample orders
        $order1 = Order::create([
            'customer_id' => $customer1->id,
            'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'order_date' => now(),
            'deadline' => now()->addDays(7),
            'status' => 'processing',
            'notes' => 'Pesanan urgent',
            'total_amount' => 500000,
            'discount' => 0,
            'down_payment' => 200000,
            'remaining_payment' => 300000,
        ]);

        $order2 = Order::create([
            'customer_id' => $customer2->id,
            'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'order_date' => now()->subDays(2),
            'deadline' => now()->addDays(5),
            'status' => 'pending',
            'notes' => '',
            'total_amount' => 750000,
            'discount' => 0,
            'down_payment' => 300000,
            'remaining_payment' => 450000,
        ]);

        $order3 = Order::create([
            'customer_id' => $customer3->id,
            'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'order_date' => now()->subDays(10),
            'deadline' => now()->subDays(2),
            'status' => 'paid',
            'notes' => 'Pesanan selesai dan lunas',
            'total_amount' => 1200000,
            'discount' => 0,
            'down_payment' => 600000,
            'remaining_payment' => 0,
        ]);

        // Create order items for order 1
        OrderItem::create([
            'order_id' => $order1->id,
            'item_name' => 'Kemeja Formal',
            'description' => 'Kemeja kerja formal',
            'category' => 'Baju',
            'fabric_type' => 'Katun',
            'color' => 'Putih',
            'size' => 'L',
            'quantity' => 2,
            'price' => 150000,
            'notes' => 'Pakai kancing khusus',
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'item_name' => 'Celana Kantor',
            'description' => 'Celana panjang kerja',
            'category' => 'Celana',
            'fabric_type' => 'Wol',
            'color' => 'Hitam',
            'size' => '32',
            'quantity' => 1,
            'price' => 200000,
            'notes' => '',
        ]);

        // Create order items for order 2
        OrderItem::create([
            'order_id' => $order2->id,
            'item_name' => 'Jas Almamater',
            'description' => 'Jas untuk almamater',
            'category' => 'Jas',
            'fabric_type' => 'Sutra',
            'color' => 'Navy',
            'size' => 'M',
            'quantity' => 1,
            'price' => 750000,
            'notes' => 'Bordir logo kampus',
        ]);

        // Create order items for order 3
        OrderItem::create([
            'order_id' => $order3->id,
            'item_name' => 'Gaun Pesta',
            'description' => 'Gaun untuk acara pesta',
            'category' => 'Gaun',
            'fabric_type' => 'Satin',
            'color' => 'Merah',
            'size' => 'S',
            'quantity' => 1,
            'price' => 1200000,
            'notes' => 'Dengan hiasan payet',
        ]);

        // Create payments
        Payment::create([
            'order_id' => $order1->id,
            'type' => 'down_payment',
            'amount' => 200000,
            'payment_method' => 'cash',
            'payment_date' => now(),
            'notes' => 'DP saat pesan',
        ]);

        Payment::create([
            'order_id' => $order2->id,
            'type' => 'down_payment',
            'amount' => 300000,
            'payment_method' => 'transfer',
            'payment_date' => now()->subDays(2),
            'notes' => 'Transfer BCA',
        ]);

        Payment::create([
            'order_id' => $order3->id,
            'type' => 'down_payment',
            'amount' => 600000,
            'payment_method' => 'cash',
            'payment_date' => now()->subDays(10),
            'notes' => 'DP pertama',
        ]);

        Payment::create([
            'order_id' => $order3->id,
            'type' => 'remaining_payment',
            'amount' => 600000,
            'payment_method' => 'transfer',
            'payment_date' => now()->subDays(1),
            'notes' => 'Pelunasan',
        ]);

        // Create sample expenses
        $expenses = [
            ['date' => now(), 'category' => 'Benang', 'description' => 'Benang jahit warna-warni 20 gulung', 'amount' => 45000],
            ['date' => now()->subDay(), 'category' => 'Resleting', 'description' => 'Resleting YKK berbagai ukuran 10 pcs', 'amount' => 35000],
            ['date' => now()->subDays(2), 'category' => 'Listrik', 'description' => 'Tagihan listrik bulan ini', 'amount' => 250000],
            ['date' => now()->subDays(4), 'category' => 'Jarum', 'description' => 'Jarum mesin jahit 5 pack', 'amount' => 25000],
            ['date' => now()->subDays(6), 'category' => 'Servis Mesin', 'description' => 'Servis rutin mesin jahit Brother', 'amount' => 150000],
            ['date' => now()->subDays(8), 'category' => 'Kain', 'description' => 'Kain pelapis hitam 3 meter', 'amount' => 75000],
            ['date' => now()->subDays(11), 'category' => 'Lainnya', 'description' => 'Alat tulis dan kantong plastik', 'amount' => 30000],
        ];
        foreach ($expenses as $e) {
            Expense::create($e);
        }
    }
}