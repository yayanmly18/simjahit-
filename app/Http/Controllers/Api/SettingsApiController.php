<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsApiController
{
    public function index()
    {
        $settings = DB::table('settings')->get()->pluck('value', 'key');
        
        return response()->json([
            'storeName' => $settings->get('store_name', 'A.Y.A Tailor'),
            'address' => $settings->get('address', 'Jl. Sudirman No. 45, Bandung'),
            'phone' => $settings->get('phone', '022-1234567'),
            'whatsapp' => $settings->get('whatsapp', '081234567890'),
            'notifications' => [
                'order_complete' => $settings->get('notif_order_complete', true),
                'deadline_reminder' => $settings->get('notif_deadline_reminder', true),
                'stock_alert' => $settings->get('notif_stock_alert', false),
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'storeName' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'notifications' => 'nullable|array',
            'notifications.order_complete' => 'boolean',
            'notifications.deadline_reminder' => 'boolean',
            'notifications.stock_alert' => 'boolean',
        ]);

        $settings = [
            'store_name' => $validated['storeName'] ?? 'A.Y.A Tailor',
            'address' => $validated['address'] ?? 'Jl. Sudirman No. 45, Bandung',
            'phone' => $validated['phone'] ?? '022-1234567',
            'whatsapp' => $validated['whatsapp'] ?? '081234567890',
            'notif_order_complete' => $validated['notifications']['order_complete'] ?? true,
            'notif_deadline_reminder' => $validated['notifications']['deadline_reminder'] ?? true,
            'notif_stock_alert' => $validated['notifications']['stock_alert'] ?? false,
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan',
            'settings' => $settings
        ]);
    }
}