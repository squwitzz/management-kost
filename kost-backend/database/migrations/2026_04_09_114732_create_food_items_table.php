<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('food_items', function (Blueprint $table) {
            $table->id();
            $table->string('nama_makanan');
            $table->string('nama_vendor');
            $table->integer('harga');
            $table->string('gambar')->nullable();
            $table->enum('status_stok', ['Tersedia', 'Habis'])->default('Tersedia');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('food_items');
    }
};
