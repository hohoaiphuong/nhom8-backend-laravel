<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('the_loai', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('the_loai');
    }
};

