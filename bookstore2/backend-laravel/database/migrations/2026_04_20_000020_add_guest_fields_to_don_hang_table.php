<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('don_hang', function (Blueprint $table) {
            // Make foreign keys nullable for guest orders
            $table->unsignedBigInteger('nguoi_dung_id')->nullable()->change();
            $table->unsignedBigInteger('dia_chi_id')->nullable()->change();
            
            // Add guest contact fields
            $table->string('email')->nullable()->after('dia_chi_id');
            $table->string('so_dien_thoai')->nullable()->after('email');
            $table->text('dia_chi')->nullable()->after('so_dien_thoai');
            $table->string('ten_khach')->nullable()->after('dia_chi');
            $table->string('phuong_thuc_van_chuyen')->default('standard')->after('ten_khach');
        });
    }

    public function down(): void
    {
        Schema::table('don_hang', function (Blueprint $table) {
            $table->dropColumn(['email', 'so_dien_thoai', 'dia_chi', 'ten_khach', 'phuong_thuc_van_chuyen']);
        });
    }
};
