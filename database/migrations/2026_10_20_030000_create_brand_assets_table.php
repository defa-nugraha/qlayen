<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brand_assets', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('label', 120);
            $table->string('path');
            $table->string('alt_text', 160)->nullable();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brand_assets');
    }
};
