<?php

namespace App\Jobs;

use App\Infrastructure\Messaging\WhatsAppGateway;
use App\Models\Customer;
use App\Models\Workspace;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use RuntimeException;
use Throwable;

class SendWhatsAppCampaignMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300, 900];

    public function __construct(
        public int $workspaceId,
        public int $customerId,
        public string $message,
    ) {}

    public function handle(WhatsAppGateway $gateway): void
    {
        $workspace = Workspace::query()->find($this->workspaceId);
        $customer = Customer::query()->whereKey($this->customerId)
            ->where('workspace_id', $this->workspaceId)
            ->where('status', 'active')
            ->whereNotNull('whatsapp_consent_at')
            ->whereNotNull('phone')
            ->first();

        if ($workspace === null || $customer === null || blank($customer->phone)) {
            return;
        }

        $response = $gateway->sendMessageForWorkspace($workspace, $customer->phone, $this->message);

        if (($response['status'] ?? false) !== true) {
            throw new RuntimeException((string) ($response['msg'] ?? 'WhatsApp gateway rejected campaign message.'));
        }
    }
}
