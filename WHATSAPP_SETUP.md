# Panduan Konfigurasi WhatsApp

Panduan ini menjelaskan cara mengaktifkan fitur notifikasi WhatsApp untuk A.Y.A Tailor menggunakan **WhatsApp Cloud API** dari Meta.

## 📋 Prasyarat

1. Akun Facebook Business Manager
2. Nomor telepon yang terhubung ke WhatsApp Business
3. Aplikasi Facebook Developer

## 🔧 Langkah-langkah Konfigurasi

### 1. Buat Aplikasi di Facebook Developer

1. Kunjungi [Facebook Developer Portal](https://developers.facebook.com/apps)
2. Klik **"Create App"** → Pilih **"Business"**
3. Isi nama aplikasi (misal: A.Y.A Tailor WhatsApp)
4. Tambahkan **WhatsApp** product ke aplikasi

### 2. Dapatkan Kredensial

Setelah aplikasi dibuat, Anda akan mendapatkan:

#### a. **Phone Number ID**
- Masuk ke aplikasi → WhatsApp → Settings
- Cari **"Phone Number ID"**
- Contoh: `1234567890123456`

#### b. **Access Token**
- Di halaman yang sama, klik **"Generate Token"**
- Pilih permissions yang dibutuhkan
- Copy token yang dihasilkan
- Contoh: `EAAGm0PX4ZCpsBAKZC...`

#### c. **Business Account ID**
- Masuk ke [Business Manager](https://business.facebook.com/settings)
- Copy **Business Account ID**
- Contoh: `987654321098765`

### 3. Update File `.env`

Buka file `.env` di root project dan update bagian WhatsApp Configuration:

```env
# WhatsApp Configuration (Using WhatsApp Cloud API - Meta)
WA_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
WA_API_TOKEN=your_access_token_here
WA_PHONE_NUMBER_ID=your_phone_number_id_here
WA_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

**Contoh yang sudah diisi:**
```env
WA_API_URL=https://graph.facebook.com/v18.0/1234567890123456/messages
WA_API_TOKEN=EAAGm0PX4ZCpsBAKZC...
WA_PHONE_NUMBER_ID=1234567890123456
WA_BUSINESS_ACCOUNT_ID=987654321098765
```

### 4. Test Koneksi

Setelah konfigurasi, test dengan cara:

1. Buka aplikasi A.Y.A Tailor
2. Buat pesanan baru
3. Klik tombol **WhatsApp** di halaman detail pesanan
4. Jika berhasil, akan muncul notifikasi "WhatsApp berhasil dikirim!"

## 📱 Format Nomor Telepon

Sistem otomatis mengubah format nomor telepon:
- `0812-3456-7890` → `6281234567890`
- `812-3456-7890` → `6281234567890`

Pastikan nomor telepon customer sudah terdaftar dengan benar di database.

## 🔍 Troubleshooting

### Error: "WhatsApp belum dikonfigurasi (WA_API_TOKEN kosong)"

**Penyebab:** Token belum diisi di file `.env`

**Solusi:**
1. Pastikan `WA_API_TOKEN` sudah diisi dengan access token yang valid
2. Pastikan `WA_PHONE_NUMBER_ID` sudah diisi
3. Restart aplikasi setelah mengubah `.env`

### Error: "Invalid phone number"

**Penyebab:** Format nomor telepon tidak valid

**Solusi:**
- Nomor harus diawali dengan `62` (kode negara Indonesia)
- Tidak ada spasi atau tanda hubung
- Contoh: `6281234567890`

### Error: "Authentication failed"

**Penyebab:** Access token salah atau expired

**Solusi:**
1. Regenerate access token di Facebook Developer Portal
2. Update token baru di file `.env`
3. Restart aplikasi

### Pesan tidak terkirim

**Penyebab:** 
- Nomor tidak terdaftar di WhatsApp Business
- Template message belum disetujui (untuk pesan template)

**Solusi:**
1. Pastikan nomor tujuan aktif di WhatsApp
2. Untuk pesan template, buat template di Facebook Business Manager dan tunggu persetujuan Meta

## 📊 Monitoring

Log WhatsApp API dapat dilihat di file log Laravel:

```bash
tail -f storage/logs/laravel.log
```

Format log:
```
[2024-01-15 10:30:45] local.INFO: WhatsApp API Response {"status":200,"body":{...}}
```

## 🔐 Keamanan

- **Jangan** commit file `.env` ke version control
- **Jangan** share access token ke orang lain
- Rotate token secara berkala untuk keamanan
- Gunakan environment variables untuk production

## 📚 Referensi

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Facebook Developer Portal](https://developers.facebook.com/apps)
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)

## 💡 Tips

1. **Gunakan Webhook** untuk menerima status pesan (terkirim/dibaca)
2. **Buat Template Messages** untuk pesan yang sering dikirim
3. **Monitor Rate Limits** - WhatsApp Cloud API memiliki batasan pengiriman
4. **Test di Development Mode** sebelum production

## 🆘 Bantuan

Jika mengalami kendala:
1. Cek log di `storage/logs/laravel.log`
2. Pastikan semua kredensial sudah benar
3. Test API menggunakan Postman/Insomnia terlebih dahulu
4. Hubungi support Meta jika masalah berlanjut