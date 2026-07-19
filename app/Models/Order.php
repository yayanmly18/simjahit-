<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'order_number',
        'order_date',
        'deadline',
        'status',
        'notes',
        'total_amount',
        'discount',
        'down_payment',
        'remaining_payment',
    ];

    protected $casts = [
        'order_date' => 'date',
        'deadline' => 'date',
        'total_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'remaining_payment' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}