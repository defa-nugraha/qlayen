<?php

namespace App\Console\Commands;

use App\Jobs\SendCustomerFollowUpWhatsApp;
use App\Models\Customer;
use Illuminate\Console\Command;

class QueueWhatsAppFollowUps extends Command
{
    protected $signature = 'follow-ups:queue-whatsapp';

    protected $description = 'Queue eligible customer follow-ups for WhatsApp delivery';

    public function handle(): int
    {
        $queued = 0;
        $now = now();

        CustomerFollowUpDelivery::query()
            ->where('status', 'sending')
            ->where('updated_at', '<', $now->copy()->subMinutes(15))
            ->update([
                'status' => 'pending',
                'last_error' => 'Recovered a stale in-progress delivery.',
                'updated_at' => $now,
            ]);

        Customer::query()
            ->whereNotNull('workspace_id')
            ->whereNotNull('follow_up_at')
            ->where('follow_up_at', '<=', $now)
            ->where('follow_up_whatsapp_enabled', true)
            ->whereNotNull('whatsapp_consent_at')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->where('status', 'active')
            ->whereNull('follow_up_completed_at')
            ->orderBy('id')
            ->chunkById(100, function ($customers) use (&$queued): void {
                foreach ($customers as $customer) {
                    $delivery = $customer->followUpDeliveries()->firstOrCreate(
                        [
                            'scheduled_for' => $customer->follow_up_at,
                        ],
                        [
                            'workspace_id' => $customer->workspace_id,
                            'status' => 'pending',
                        ],
                    );

                    $isStalePending = $delivery->status === 'pending'
                        && $delivery->updated_at?->lt(now()->subMinutes(5));

                    if ($delivery->wasRecentlyCreated || $isStalePending) {
                        $delivery->update(['updated_at' => now()]);
                        SendCustomerFollowUpWhatsApp::dispatch($delivery->id);
                        $queued++;
                    }
                }
            });

        $this->info("Queued {$queued} WhatsApp follow-up(s).");

        return self::SUCCESS;
    }
}
