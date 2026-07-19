<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the "finishing" status to match the UI workflow
     * (Menunggu -> Diproses -> Finishing -> Selesai -> Sudah Diambil)
     * and add a discount column to orders.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','processing','finishing','completed','paid','cancelled') NOT NULL DEFAULT 'pending'");

        Schema::table('orders', function ($table) {
            $table->decimal('discount', 12, 2)->default(0)->after('total_amount');
        });
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','processing','completed','paid','cancelled') NOT NULL DEFAULT 'pending'");

        Schema::table('orders', function ($table) {
            $table->dropColumn('discount');
        });
    }
};