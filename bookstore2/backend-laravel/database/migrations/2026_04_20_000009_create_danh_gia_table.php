<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('danh_gia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onDelete('cascade');
            $table->foreignId('sach_id')->constrained('sach')->onDelete('cascade');
            $table->integer('so_sao');
            $table->text('binh_luan')->nullable();
            $table->timestamp('ngay_tao')->useCurrent();
            $table->index(['nguoi_dung_id', 'sach_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('danh_gia');
    }
};

