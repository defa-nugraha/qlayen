<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone', 32)->nullable();
            $table->string('email')->nullable();
            $table->string('source', 100)->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('follow_up_at')->nullable();
            $table->text('follow_up_notes')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['user_id', 'name']);
            $table->index(['user_id', 'follow_up_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
