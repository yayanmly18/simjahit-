<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // order_created, order_status, payment_received, deadline_reminder
            $table->string('title');
            $table->text('message');
            $table->string('icon')->nullable(); // icon name for UI
            $table->string('color')->nullable(); // color class for UI
            $table->string('link_type')->nullable(); // page to navigate to
            $table->string('link_id')->nullable(); // id to pass
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};