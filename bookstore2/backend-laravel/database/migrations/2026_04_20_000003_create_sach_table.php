<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sach', function (Blueprint $table) {
            $table->id();
            $table->string('ten_sach', 255);
            $table->string('tac_gia', 100);
            $table->decimal('gia', 10, 2);
            $table->integer('so_luong');
            $table->foreignId('the_loai_id')->constrained('the_loai')->onDelete('cascade');
            $table->longText('hinh_anh')->nullable();
            $table->text('mo_ta')->nullable();
            
            $table->index('the_loai_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sach');
    }
};

