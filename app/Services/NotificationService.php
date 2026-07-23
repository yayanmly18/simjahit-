<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;

class NotificationService
{
    /**
     * Create notification when a new order is created
     */
    public function orderCreated(Order $order): Notification
    {
        return Notification::create([
            'type' => 'order_created',
            'title' => 'Pesanan Baru',
            'message' => 'Pesanan baru berhasil ditambahkan',
            'icon' => 'ShoppingBag',
            'color' => 'blue',
            'link_type' => 'order-detail',
            'link_id' => (string) $order->id,
        ]);
    }

    /**
     * Create notification when order status changes
     */
    public function orderStatusChanged(Order $order, string $oldStatus, string $newStatus): Notification
    {
        $statusLabels = [
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'finishing' => 'Finishing',
            'completed' => 'Selesai',
            'paid' => 'Sudah Diambil',
        ];

        $newLabel = $statusLabels[$newStatus] ?? $newStatus;
        $customerName = $order->customer->name ?? 'Pelanggan';

        $icon = match ($newStatus) {
            'processing' => 'Clock',
            'finishing' => 'Scissors',
            'completed' => 'CheckCircle2',
            'paid' => 'Package',
            default => 'Bell',
        };

        $color = match ($newStatus) {
            'processing' => 'amber',
            'finishing' => 'purple',
            'completed' => 'green',
            'paid' => 'slate',
            default => 'blue',
        };

        return Notification::create([
            'type' => 'order_status',
            'title' => 'Status Pesanan Berubah',
            'message' => "Pesanan {$order->order_number} ({$customerName}) sekarang: {$newLabel}",
            'icon' => $icon,
            'color' => $color,
            'link_type' => 'order-detail',
            'link_id' => (string) $order->id,
        ]);
    }

    /**
     * Create notification when payment is received
     */
    public function paymentReceived(Order $order, float $amount, string $type): Notification
    {
        $customerName = $order->customer->name ?? 'Pelanggan';
        $fmtAmount = 'Rp ' . number_format($amount, 0, ',', '.');

        $title = $type === 'down_payment' ? 'Pembayaran DP' : 'Pembayaran Lunas';

        return Notification::create([
            'type' => 'payment_received',
            'title' => $title,
            'message' => "Pembayaran {$fmtAmount} dari {$customerName} untuk {$order->order_number}",
            'icon' => 'Banknote',
            'color' => 'green',
            'link_type' => 'order-detail',
            'link_id' => (string) $order->id,
        ]);
    }

    /**
     * Create notification for deadline reminder
     */
    public function deadlineReminder(Order $order): Notification
    {
        $customerName = $order->customer->name ?? 'Pelanggan';
        $deadline = $order->deadline ? \Carbon\Carbon::parse($order->deadline)->format('d/m/Y') : '-';

        return Notification::create([
            'type' => 'deadline_reminder',
            'title' => 'Pengingat Deadline',
            'message' => "Pesanan {$order->order_number} ({$customerName}) deadline: {$deadline}",
            'icon' => 'Calendar',
            'color' => 'red',
            'link_type' => 'order-detail',
            'link_id' => (string) $order->id,
        ]);
    }

    /**
     * Create notification when order is ready for pickup
     */
    public function orderReadyForPickup(Order $order): Notification
    {
        $customerName = $order->customer->name ?? 'Pelanggan';

        return Notification::create([
            'type' => 'order_ready',
            'title' => 'Siap Diambil',
            'message' => "Pesanan {$order->order_number} ({$customerName}) siap diambil!",
            'icon' => 'Package',
            'color' => 'green',
            'link_type' => 'order-detail',
            'link_id' => (string) $order->id,
        ]);
    }

    /**
     * Create notification when an order is updated
     */
    public function orderUpdated(Order $order): Notification
    {
        return Notification::create([
            'type' => 'order_updated',
            'title' => 'Pesanan Diperbarui',
            'message' => 'Pesanan berhasil diperbarui',
            'icon' => 'ShoppingBag',
            'color' => 'amber',
            'link_type' => 'order-detail',
            'link_id' => (string) $order->id,
        ]);
    }

    /**
     * Create notification when a new customer is added
     */
    public function customerCreated(string $customerName, int $customerId): Notification
    {
        return Notification::create([
            'type' => 'customer_created',
            'title' => 'Pelanggan Baru',
            'message' => 'Pelanggan berhasil ditambahkan',
            'icon' => 'User',
            'color' => 'blue',
            'link_type' => null,
            'link_id' => null,
        ]);
    }

    /**
     * Create notification when customer data is updated
     */
    public function customerUpdated(string $customerName, int $customerId): Notification
    {
        return Notification::create([
            'type' => 'customer_updated',
            'title' => 'Data Pelanggan Diperbarui',
            'message' => "Data pelanggan {$customerName} telah diperbarui",
            'icon' => 'User',
            'color' => 'amber',
            'link_type' => null,
            'link_id' => null,
        ]);
    }

    /**
     * Create notification when settings are updated
     */
    public function settingsUpdated(): Notification
    {
        return Notification::create([
            'type' => 'settings_updated',
            'title' => 'Pengaturan Diperbarui',
            'message' => 'Pengaturan berhasil disimpan',
            'icon' => 'Settings',
            'color' => 'slate',
            'link_type' => 'settings',
            'link_id' => null,
        ]);
    }
}
