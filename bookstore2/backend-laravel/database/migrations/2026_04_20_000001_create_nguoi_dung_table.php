<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nguoi_dung', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100);
            $table->string('email', 100)->unique();
            $table->string('mat_khau', 255);
            $table->string('so_dien_thoai', 15)->nullable();
            $table->enum('vai_tro', ['nguoi_dung', 'quan_tri'])->default('nguoi_dung');
            $table->string('api_token', 80)->nullable()->unique();
            $table->timestamp('ngay_tao')->useCurrent();
            
            $table->index(['email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nguoi_dung');
    }
};

