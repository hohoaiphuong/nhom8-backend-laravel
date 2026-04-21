<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dia_chi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nguoi_dung_id')->constrained('nguoi_dung')->onDelete('cascade');
            $table->text('dia_chi');
            $table->boolean('mac_dinh')->default(false);
            $table->index('nguoi_dung_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dia_chi');
    }
};

