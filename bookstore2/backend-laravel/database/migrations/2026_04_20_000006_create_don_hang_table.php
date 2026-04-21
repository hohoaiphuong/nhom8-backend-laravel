<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('don_hang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onDelete('cascade');
            $table->foreignId('dia_chi_id')->constrained('dia_chi')->onDelete('cascade');
            $table->decimal('tong_tien', 10, 2);
            $table->enum('trang_thai', ['cho_xu_ly', 'dang_giao', 'hoan_thanh', 'da_huy'])->default('cho_xu_ly');
            $table->timestamp('ngay_tao')->useCurrent();
            $table->index(['nguoi_dung_id', 'dia_chi_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('don_hang');
    }
};

