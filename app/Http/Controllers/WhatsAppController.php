<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WhatsAppController extends Controller
{
    public function sendOrderNotification(Order $order)
    {
        $customer = $order->customer;
        $phone = $customer->whatsapp ?? $customer->phone;

        $phone = preg_replace('/^0/', '62', $phone);

        $message = $this->buildOrderMessage($order);

        $this->sendWhatsApp($phone, $message);

        return redirect()->back()
            ->with('success', 'Notifikasi WhatsApp berhasil dikirim!');
    }

    public function sendPaymentReminder(Order $order)
    {
        $customer = $order->customer;
        $phone = $customer->whatsapp ?? $customer->phone;

        $phone = preg_replace('/^0/', '62', $phone);

        $message = $this->buildPaymentReminderMessage($order);

        $this->sendWhatsApp($phone, $message);

        return redirect()->back()
            ->with('success', 'Pengingat pembayaran berhasil dikirim!');
    }

    // API Methods for React Frontend
    public function apiSendOrderNotification(Order $order)
    {
        $customer = $order->customer;
        $phone = $customer->whatsapp ?? $customer->phone;
        $phone = preg_replace('/^0/', '62', $phone);

        $message = $this->buildOrderMessage($order);
        $sent = $this->sendWhatsApp($phone, $message);

        return response()->json([
            'success' => $sent,
            'message' => $sent ? 'Notifikasi WhatsApp berhasil dikirim!' : 'WhatsApp belum dikonfigurasi (WA_API_TOKEN kosong).',
        ]);
    }

    public function apiSendPaymentReminder(Order $order)
    {
        $customer = $order->customer;
        $phone = $customer->whatsapp ?? $customer->phone;
        $phone = preg_replace('/^0/', '62', $phone);

        $message = $this->buildPaymentReminderMessage($order);
        $sent = $this->sendWhatsApp($phone, $message);

        return response()->json([
            'success' => $sent,
            'message' => $sent ? 'Pengingat pembayaran berhasil dikirim!' : 'WhatsApp belum dikonfigurasi (WA_API_TOKEN kosong).',
        ]);
    }

    private function buildOrderMessage(Order $order)
    {
        $message = "Halo {$order->customer->name}!\n\n";
        $message .= "Pesanan Anda telah kami terima dengan detail:\n\n";
        $message .= "No. Pesanan: {$order->order_number}\n";
        $message .= "Tanggal Pesan: " . $order->order_date->format('d/m/Y') . "\n";

        if ($order->deadline) {
            $message .= "Deadline: " . $order->deadline->format('d/m/Y') . "\n";
        }

        $message .= "\nDetail Item:\n";
        foreach ($order->orderItems as $item) {
            $message .= "- {$item->item_name} ({$item->quantity}x) - Rp " . number_format($item->price * $item->quantity, 0, ',', '.') . "\n";
        }

        $netTotal = $order->total_amount - $order->discount;
        $message .= "\nTotal: Rp " . number_format($netTotal, 0, ',', '.') . "\n";
        $message .= "DP: Rp " . number_format($order->down_payment, 0, ',', '.') . "\n";
        $message .= "Sisa: Rp " . number_format($order->remaining_payment, 0, ',', '.') . "\n\n";
        $message .= "Status: " . $this->getStatusLabel($order->status) . "\n\n";
        $message .= "Terima kasih atas kepercayaan Anda!\n";
        $message .= "SimJahit - Solusi Jahit Terpercaya";

        return $message;
    }

    private function buildPaymentReminderMessage(Order $order)
    {
        $message = "Halo {$order->customer->name},\n\n";
        $message .= "Ini adalah pengingat pembayaran untuk pesanan Anda.\n\n";
        $message .= "No. Pesanan: {$order->order_number}\n";
        $message .= "Total Tagihan: Rp " . number_format($order->remaining_payment, 0, ',', '.') . "\n\n";
        $message .= "Silakan melakukan pembayaran sebelum deadline.\n\n";
        $message .= "Terima kasih!\n";
        $message .= "SimJahit";

        return $message;
    }

    private function sendWhatsApp($phone, $message)
    {
        $apiUrl = env('WA_API_URL');
        $apiToken = env('WA_API_TOKEN');
        $phoneNumberId = env('WA_PHONE_NUMBER_ID');

        if (!$apiUrl || !$apiToken || !$phoneNumberId) {
            return false;
        }

        try {
            // Format phone number (remove leading 0, add 62 if needed)
            $phone = preg_replace('/^0/', '62', $phone);
            $phone = preg_replace('/[^0-9]/', '', $phone);

            // WhatsApp Cloud API format
            $payload = [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $phone,
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $message
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiToken,
                'Content-Type' => 'application/json',
            ])->post($apiUrl, $payload);

            // Log response for debugging
            \Log::info('WhatsApp API Response', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            \Log::error('WhatsApp API Error: ' . $e->getMessage());
            return false;
        }
    }

    private function getStatusLabel($status)
    {
        return match ($status) {
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'finishing' => 'Finishing',
            'completed' => 'Selesai',
            'paid' => 'Sudah Diambil',
            'cancelled' => 'Dibatalkan',
            default => $status
        };
    }
}