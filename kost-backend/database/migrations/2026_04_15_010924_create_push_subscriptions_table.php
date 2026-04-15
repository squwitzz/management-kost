<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('endpoint');
            $table->text('public_key')->nullable();
            $table->text('auth_token')->nullable();
            $table->string('content_encoding')->default('aesgcm');
            $table->timestamps();
            
            $table->unique(['user_id', 'endpoint']);
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
