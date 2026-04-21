<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('don_hang')->onDelete('cascade');
            $table->string('phuong_thuc', 50);
            $table->string('trang_thai', 50)->default('pending');
            $table->index('don_hang_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thanh_toan');
    }
};

