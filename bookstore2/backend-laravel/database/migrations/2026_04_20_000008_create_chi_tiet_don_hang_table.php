<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chi_tiet_don_hang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('don_hang')->onDelete('cascade');
            $table->foreignId('sach_id')->constrained('sach')->onDelete('cascade');
            $table->integer('so_luong');
            $table->decimal('gia', 10, 2);
            $table->index(['don_hang_id', 'sach_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chi_tiet_don_hang');
    }
};

