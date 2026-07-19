# Setup Guide - SimJahit

Panduan lengkap untuk setup dan menjalankan sistem SimJahit.

## Prerequisites

Pastikan sistem Anda memiliki:

- PHP 8.2 atau lebih tinggi
- MySQL 5.7 atau lebih tinggi
- Composer
- Node.js & NPM
- Web Server (Apache/Nginx) atau PHP Built-in Server

## Langkah-langkah Installation

### 1. Setup Database MySQL

Buka phpMyAdmin atau MySQL command line dan buat database:

```sql
CREATE DATABASE simjahit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Konfigurasi Environment

File `.env` sudah dikonfigurasi dengan setting default. Pastikan konfigurasi database sesuai dengan sistem Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simjahit
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Database Migrations

```bash
php artisan migrate
```

### 6. (Optional) Seed Database dengan Sample Data

```bash
php artisan db:seed
```

Ini akan membuat:
- 3 sample customers
- 3 sample orders dengan berbagai status
- Order items untuk setiap pesanan
- Payment records

### 7. Build Assets

```bash
npm run build
```

### 8. Start Development Server

```bash
php artisan serve
```

Akses aplikasi di: **http://localhost:8000**

## Testing the Workflow

### Test Scenario 1: Complete Order Flow

1. **Pelanggan Datang**
   - Buka http://localhost:8000/customers/create
   - Input data pelanggan baru
   - Klik "Simpan"

2. **Input Pesanan**
   - Klik "Buat Pesanan" dari dashboard atau menu
   - Pilih pelanggan yang baru dibuat
   - Input tanggal pesan dan deadline
   - Tambah item pesanan (contoh: Kemeja, Celana)
   - Set harga dan quantity
   - Input DP jika ada
   - Klik "Simpan Pesanan"

3. **Cetak Nota**
   - Dari halaman detail pesanan, klik "Print Nota"
   - Nota akan terbuka di tab baru
   - Browser akan otomatis print (jika thermal printer terinstall)
   - Atau print manual dengan Ctrl+P

4. **Update Status**
   - Dari halaman detail pesanan, pilih status baru
   - Klik "Update Status"
   - Status berubah dari "Pending" ke "Processing"

5. **WhatsApp Notification**
   - Klik "Kirim Notifikasi WA" di halaman detail pesanan
   - Sistem akan mengirim pesan WhatsApp ke customer
   - Pastikan konfigurasi WA_API_URL, WA_API_TOKEN, dan WA_PHONE_NUMBER sudah diisi

6. **Pembayaran**
   - Klik "Catat Pembayaran" di halaman detail pesanan
   - Input jumlah pembayaran dan metode
   - Klik "Simpan Pembayaran"
   - Sistem otomatis menghitung sisa pembayaran
   - Jika total pembayaran >= total pesanan, status otomatis menjadi "Paid"

### Test Scenario 2: Thermal Printer

1. Pastikan thermal printer sudah terinstall di sistem
2. Konfigurasi printer name di `.env`:
   ```
   PRINTER_NAME=Your_Printer_Name
   ```
3. Buka detail pesanan
4. Klik "Print Nota"
5. Nota akan otomatis print ke thermal printer

**Catatan:** Untuk menggunakan fitur thermal printer dengan library escpos-php:

```bash
composer require mike42/escpos-php
```

### Test Scenario 3: WhatsApp Integration

1. Konfigurasi WhatsApp API di `.env`:
   ```env
   WA_API_URL=https://graph.facebook.com/v18.0/your_phone_number_id/messages
   WA_API_TOKEN=your_access_token
   WA_PHONE_NUMBER=your_phone_number
   ```

2. Pastikan nomor WhatsApp customer sudah diisi (format: 08123456789)

3. Dari halaman detail pesanan, klik "Kirim Notifikasi WA"

4. Cek log di `storage/logs/laravel.log` jika ada error

## Fitur yang Tersedia

### ✅ Customer Management
- [x] Tambah pelanggan baru
- [x] Edit data pelanggan
- [x] Hapus pelanggan
- [x] Lihat detail pelanggan
- [x] Riwayat pesanan pelanggan
- [x] Statistik pengeluaran

### ✅ Order Management
- [x] Buat pesanan baru
- [x] Edit pesanan
- [x] Hapus pesanan
- [x] Lihat detail pesanan
- [x] Multiple items per order
- [x] Set deadline
- [x] Set down payment
- [x] Auto-generate order number

### ✅ Order Status Tracking
- [x] Pending (Menunggu)
- [x] Processing (Sedang Dikerjakan)
- [x] Completed (Selesai)
- [x] Paid (Lunas)
- [x] Cancelled (Dibatalkan)

### ✅ Thermal Printer Integration
- [x] Print nota 80mm
- [x] ESC/POS format
- [x] Auto-cut paper
- [x] Item details
- [x] Payment summary
- [x] Customer info

### ✅ WhatsApp Automation
- [x] Notifikasi pesanan baru
- [x] Pengingat pembayaran
- [x] Format pesan otomatis
- [x] Support multiple API

### ✅ Payment System
- [x] Catat down payment
- [x] Catat pembayaran sisa
- [x] Multiple payment method (Cash, Transfer, E-Wallet)
- [x] Tracking sisa pembayaran
- [x] Auto-update status ke "Paid"
- [x] Riwayat pembayaran

### ✅ Dashboard
- [x] Total pesanan
- [x] Pesanan menunggu
- [x] Pesanan sedang dikerjakan
- [x] Pesanan selesai & lunas
- [x] Total pendapatan
- [x] Pesanan terbaru

## Troubleshooting

### Error: "SQLSTATE[HY000] [2002] Connection refused"
**Solusi:** Pastikan MySQL service sudah running
```bash
# Windows
net start MySQL

# Linux
sudo systemctl start mysql
```

### Error: "No application encryption key has been specified"
**Solusi:** Generate application key
```bash
php artisan key:generate
```

### Error: "Class 'ThermalPrinterService' not found"
**Solusi:** Clear cache dan regenerate autoload
```bash
php artisan optimize:clear
composer dump-autoload
```

### Thermal Printer Tidak Print
1. Pastikan printer sudah terinstall
2. Check printer name di `.env`
3. Install escpos-php:
   ```bash
   composer require mike42/escpos-php
   ```
4. Check log: `storage/logs/laravel.log`

### WhatsApp Tidak Terkirim
1. Pastikan API credentials benar
2. Check format nomor (harus 62xxx)
3. Test API dengan Postman
4. Check log error

## Production Deployment

### 1. Set Production Environment

Edit `.env`:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
```

### 2. Optimize Application

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Set Permissions

```bash
chmod -R 775 storage bootstrap/cache
```

### 4. Use Queue for WhatsApp (Optional)

Untuk mengirim WhatsApp secara asynchronous:

```bash
php artisan queue:work --daemon
```

## Support

Jika mengalami masalah, check:
1. Log file: `storage/logs/laravel.log`
2. Browser console untuk JavaScript errors
3. Network tab untuk API errors

## Next Steps

- [ ] Install escpos-php untuk thermal printer
- [ ] Konfigurasi WhatsApp Business API
- [ ] Setup email notifications
- [ ] Add user authentication
- [ ] Add reporting & analytics
- [ ] Add barcode/QR code for orders
- [ ] Mobile app integration

## License

MIT License