<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationApiController extends Controller
{
    /**
     * Get all notifications (recent first)
     */
    public function index()
    {
        $notifications = Notification::recent(50)->get();
        $unreadCount = Notification::unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread notifications only
     */
    public function unread()
    {
        $notifications = Notification::unread()->recent(20)->get();
        $count = $notifications->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark a single notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Notification::unread()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah dibaca',
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dihapus',
        ]);
    }

    /**
     * Clear all notifications
     */
    public function clearAll()
    {
        Notification::truncate();

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah dibersihkan',
        ]);
    }
}