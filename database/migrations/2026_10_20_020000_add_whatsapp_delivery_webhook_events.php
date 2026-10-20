<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_follow_up_deliveries', function (Blueprint $table) {
            $table->string('provider_message_id')->nullable()->index();
            $table->dateTime('delivered_at')->nullable();
            $table->dateTime('read_at')->nullable();
        });

        Schema::create('whatsapp_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id')->unique();
            $table->foreignId('delivery_id')->nullable()
                ->constrained('customer_follow_up_deliveries')->nullOnDelete();
            $table->string('event_status', 20);
            $table->json('payload');
            $table->timestamps();
            $table->index(['delivery_id', 'event_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_webhook_events');

        Schema::table('customer_follow_up_deliveries', function (Blueprint $table) {
            $table->dropIndex(['provider_message_id']);
            $table->dropColumn(['provider_message_id', 'delivered_at', 'read_at']);
        });
    }
};
