<?php

namespace App\Jobs;

use App\Infrastructure\Messaging\WhatsAppGateway;
use App\Models\CustomerFollowUpDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use RuntimeException;
use Throwable;

class SendCustomerFollowUpWhatsApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /**
     * @var list<int>
     */
    public array $backoff = [60, 300, 900];

    public function __construct(public int $deliveryId)
    {
    }

    public function handle(WhatsAppGateway $gateway): void
    {
        $delivery = CustomerFollowUpDelivery::query()
            ->with('customer')
            ->find($this->deliveryId);

        if ($delivery === null || $delivery->status === 'sent' || $delivery->status === 'skipped') {
            return;
        }

        $customer = $delivery->customer;

        if (
            $customer === null
            || ! $customer->follow_up_whatsapp_enabled
            || $customer->consent_at === null
            || blank($customer->phone)
            || $customer->status !== 'active'
            || $customer->follow_up_completed_at !== null
            || $customer->follow_up_at === null
            || ! $customer->follow_up_at->equalTo($delivery->scheduled_for)
        ) {
            $delivery->update([
                'status' => 'skipped',
                'last_error' => 'Customer is no longer eligible for automated follow-up.',
            ]);

            return;
        }

        $delivery->increment('attempts');
        $message = 'Halo '.$customer->name.', ini pengingat tindak lanjut dari kami.';

        if (filled($customer->follow_up_notes)) {
            $message .= "\n".$customer->follow_up_notes;
        }

        $message .= "\nJika tidak ingin menerima pesan lanjutan, silakan beri tahu kami.";

        $response = $gateway->sendMessage((string) $customer->phone, $message);

        if (($response['status'] ?? false) !== true) {
            throw new RuntimeException('WhatsApp gateway did not confirm message acceptance.');
        }

        $delivery->update([
            'status' => 'sent',
            'sent_at' => now(),
            'provider_response' => $response,
            'last_error' => null,
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        CustomerFollowUpDelivery::query()
            ->whereKey($this->deliveryId)
            ->whereNotIn('status', ['sent', 'skipped'])
            ->update([
                'status' => 'failed',
                'last_error' => mb_substr(
                    $exception?->getMessage() ?? 'WhatsApp delivery failed.',
                    0,
                    2000,
                ),
            ]);
    }
}
