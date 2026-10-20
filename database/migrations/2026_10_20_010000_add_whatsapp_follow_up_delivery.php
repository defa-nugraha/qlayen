<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->boolean('follow_up_whatsapp_enabled')->default(false)->after('follow_up_completed_at');
        });

        Schema::create('customer_follow_up_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->dateTime('scheduled_for');
            $table->string('status', 20)->default('pending');
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->dateTime('sent_at')->nullable();
            $table->json('provider_response')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'scheduled_for'], 'customer_follow_up_delivery_unique_schedule');
            $table->index(['status', 'scheduled_for']);
            $table->index(['workspace_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_follow_up_deliveries');

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('follow_up_whatsapp_enabled');
        });
    }
};
