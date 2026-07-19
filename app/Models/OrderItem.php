<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'item_name',
        'description',
        'category',
        'fabric_type',
        'color',
        'size',
        'quantity',
        'price',
        'measurements',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'measurements' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}