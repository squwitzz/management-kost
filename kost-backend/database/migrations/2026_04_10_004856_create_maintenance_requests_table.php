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
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('kategori', ['Plumbing', 'Electrical', 'Furniture', 'HVAC', 'Appliances']);
            $table->text('deskripsi');
            $table->string('foto')->nullable();
            $table->enum('prioritas', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->enum('status', ['New', 'In Progress', 'Resolved'])->default('New');
            $table->boolean('is_draft')->default(false);
            $table->text('catatan_admin')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
