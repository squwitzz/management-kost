<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('jumlah_tagihan');
            $table->integer('tarif_dasar')->default(0); // Base rate from room
            $table->integer('total_additional_charges')->default(0); // Sum of additional charges
            $table->integer('total_discount')->default(0); // Total discount
            $table->enum('status_bayar', ['Belum Lunas', 'Menunggu Verifikasi', 'Lunas'])->default('Belum Lunas');
            $table->string('bulan_dibayar'); // Format: YYYY-MM or "Januari 2026"
            $table->date('due_date')->nullable(); // Tanggal jatuh tempo
            $table->string('bukti_bayar')->nullable();
            $table->text('notes')->nullable(); // Catatan admin
            $table->boolean('is_finalized')->default(false); // Sudah di-finalize atau masih draft
            $table->timestamp('tanggal_upload')->nullable();
            $table->timestamp('tanggal_verifikasi')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
