# SimJahit - Sistem Manajemen Jahit

Sistem manajemen untuk usaha jahit dengan fitur lengkap including customer management, order tracking, thermal printer integration, WhatsApp automation, dan payment system.

## Alur Kerja Sistem

1. **Pelanggan Datang** - Input data pelanggan baru
2. **Input Pesanan** - Buat pesanan dengan detail item
3. **Cetak Nota** - Print nota untuk thermal printer
4. **Tempel Nota** - Nota ditempel di barang
5. **Pengerjaan** - Update status pesanan
6. **Update Status** - Tracking progress pesanan
7. **WA Otomatis** - Kirim notifikasi WhatsApp
8. **Pembayaran** - Catat pembayaran dan tracking

## Requirements

- PHP >= 8.2
- MySQL >= 5.7
- Composer
- Node.js & NPM
- Thermal Printer (optional, untuk print nota)

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd simjahit
```

### 2. Install Dependencies
```bash
composer install
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` dan konfigurasi:
```bash
cp .env.example .env
```

Edit file `.env`:
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=simjahit
DB_USERNAME=root
DB_PASSWORD=

# WhatsApp Configuration (optional)
WA_API_URL=https://api.whatsapp.com/send
WA_API_TOKEN=your_api_token
WA_PHONE_NUMBER=your_phone_number

# Thermal Printer Configuration (optional)
PRINTER_NAME=thermal_printer
PRINTER_WIDTH=80
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Create Database
Buat database MySQL dengan nama `simjahit`:
```sql
CREATE DATABASE simjahit;
```

### 6. Run Migrations
```bash
php artisan migrate
```

### 7. Build Assets
```bash
npm run build
```

### 8. Start Development Server
```bash
php artisan serve
```

Akses aplikasi di: `http://localhost:8000`

## Fitur Utama

### 1. Manajemen Pelanggan
- Tambah, edit, hapus pelanggan
- Lihat riwayat pesanan pelanggan
- Tracking total pengeluaran

### 2. Manajemen Pesanan
- Buat pesanan dengan multiple items
- Set deadline dan down payment
- Update status pesanan
- Print nota thermal printer
- Edit dan hapus pesanan

### 3. Status Pesanan
- Pending (Menunggu)
- Processing (Sedang Dikerjakan)
- Completed (Selesai)
- Paid (Lunas)
- Cancelled (Dibatalkan)

### 4. Sistem Pembayaran
- Catat down payment
- Catat pembayaran sisa
- Multiple payment method (Cash, Transfer, E-Wallet)
- Tracking sisa pembayaran
- Auto-update status ke "Paid" ketika lunas

### 5. Thermal Printer Integration
- Print nota otomatis
- Format 80mm untuk thermal printer
- ESC/POS command support
- Auto-cut paper

### 6. WhatsApp Automation
- Kirim notifikasi pesanan baru
- Kirim pengingat pembayaran
- Format pesan otomatis
- Support multiple WhatsApp API

## Struktur Database

### Tables
1. **customers** - Data pelanggan
2. **orders** - Data pesanan
3. **order_items** - Detail item pesanan
4. **payments** - Riwayat pembayaran

### Relationships
- Customer has many Orders
- Order has many OrderItems
- Order has many Payments
- Order belongs to Customer

## Tech Stack

- **Backend**: Laravel 12.0
- **Frontend**: Tailwind CSS, Font Awesome
- **Database**: MySQL
- **Printing**: ESC/POS, escpos-php (optional)
- **WhatsApp**: HTTP API integration

## Konfigurasi Thermal Printer

### Windows
1. Install printer driver
2. Set printer name di `.env`:
   ```
   PRINTER_NAME=Your_Printer_Name
   ```
3. Install escpos-php (optional):
   ```bash
   composer select/mike42/escpos-php
   ```

### Linux
1. Install CUPS dan printer
2. Set printer name di `.env`:
   ```
   PRINTER_NAME=your_printer_queue_name
   ```

## Konfigurasi WhatsApp

### Menggunakan WhatsApp Business API
1. Daftar di [WhatsApp Business Platform](https://business.whatsapp.com/)
2. Dapatkan API Token dan Phone Number
3. Konfigurasi di `.env`:
   ```env
   WA_API_URL=https://graph.facebook.com/v18.0/your_phone_number_id/messages
   WA_API_TOKEN=your_access_token
   WA_PHONE_NUMBER=your_phone_number
   ```

### Menggunakan Third-Party Service
Alternatif service yang bisa digunakan:
- Twilio WhatsApp API
- WhatsApp Cloud API (Meta)
- Fonnte
- Wati.io
- Custom WhatsApp Gateway

## Development

### Run Tests
```bash
php artisan test
```

### Code Style
```bash
# Format code dengan Laravel Pint
./vendor/bin/pint
```

### Clear Cache
```bash
php artisan optimize:clear
```

## Production Deployment

### 1. Set Environment
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

### 4. Queue Worker (untuk WhatsApp async)
```bash
php artisan queue:work --daemon
```

## Troubleshooting

### Thermal Printer Tidak Print
1. Pastikan printer sudah terinstall di sistem
2. Check printer name di `.env`
3. Cek log di `storage/logs/laravel.log`
4. Pastikan printer dalam keadaan online

### WhatsApp Tidak Terkirim
1. Check API URL dan Token di `.env`
2. Pastikan nomor WhatsApp dalam format internasional (62xxx)
3. Cek log error di Laravel
4. Test API dengan Postman/Thunder Client

### Database Connection Error
1. Pastikan MySQL service running
2. Check database credentials di `.env`
3. Pastikan database sudah dibuat

## Support

Untuk pertanyaan dan support, silakan hubungi tim development.

## License

MIT License - SimJahit Sistem Manajemen Jahit