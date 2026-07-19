<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['name', 'price', 'estimated_days', 'status', 'description'];

    protected $casts = [
        'price' => 'decimal:2',
        'estimated_days' => 'integer',
    ];
}