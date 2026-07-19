<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // baju, celana, jas, dll
            $table->string('fabric_type')->nullable(); // katun, sutra, dll
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('price', 12, 2);
            $table->text('measurements')->nullable(); // JSON format untuk ukuran
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};