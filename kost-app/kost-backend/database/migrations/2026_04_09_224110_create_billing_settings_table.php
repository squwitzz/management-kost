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
        Schema::create('billing_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('billing_cycle_days')->default(30); // 25, 28, 30, atau custom
            $table->integer('due_date_day')->default(5); // Tanggal jatuh tempo (1-31)
            $table->decimal('late_fee_percentage', 5, 2)->nullable(); // Denda keterlambatan (%)
            $table->decimal('late_fee_amount', 10, 2)->nullable(); // Atau denda flat
            $table->integer('grace_period_days')->default(3); // Masa tenggang
            $table->boolean('auto_generate')->default(false); // Auto generate atau manual
            $table->integer('auto_generate_day')->default(25); // Tanggal auto generate (1-31)
            $table->boolean('enable_late_fee')->default(false); // Aktifkan denda
            $table->enum('late_fee_type', ['percentage', 'fixed'])->default('fixed'); // Tipe denda
            $table->timestamps();
        });

        // Insert default settings
        DB::table('billing_settings')->insert([
            'billing_cycle_days' => 30,
            'due_date_day' => 5,
            'late_fee_amount' => 50000,
            'grace_period_days' => 3,
            'auto_generate' => false,
            'auto_generate_day' => 25,
            'enable_late_fee' => false,
            'late_fee_type' => 'fixed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_settings');
    }
};
