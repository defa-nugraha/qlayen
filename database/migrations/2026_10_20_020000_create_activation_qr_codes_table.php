<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activation_qr_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generated_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('generated_workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->foreignId('workspace_id')->nullable()->constrained('workspaces')->nullOnDelete();
            $table->foreignId('activated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name', 120);
            $table->string('token', 64)->unique();
            $table->string('foreground_color', 7)->default('#111827');
            $table->string('background_color', 7)->default('#FFFFFF');
            $table->string('frame_text', 80)->default('SCAN TO ACTIVATE');
            $table->string('status', 20)->default('pending');
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
            $table->index(['generated_workspace_id', 'status']);
            $table->index(['workspace_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activation_qr_codes');
    }
};
