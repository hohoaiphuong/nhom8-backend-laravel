<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sach', function (Blueprint $table) {
            // Change hinh_anh from varchar(255) to LONGTEXT to support base64 images
            $table->longText('hinh_anh')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sach', function (Blueprint $table) {
            $table->string('hinh_anh', 255)->nullable()->change();
        });
    }
};
