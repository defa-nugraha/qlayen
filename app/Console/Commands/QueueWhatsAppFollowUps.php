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

        Customer::query()
            ->whereNotNull('workspace_id')
            ->whereNotNull('follow_up_at')
            ->where('follow_up_at', '<=', $now)
            ->where('follow_up_whatsapp_enabled', true)
            ->whereNotNull('consent_at')
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

                    if ($delivery->wasRecentlyCreated) {
                        SendCustomerFollowUpWhatsApp::dispatch($delivery->id);
                        $queued++;
                    }
                }
            });

        $this->info("Queued {$queued} WhatsApp follow-up(s).");

        return self::SUCCESS;
    }
}
