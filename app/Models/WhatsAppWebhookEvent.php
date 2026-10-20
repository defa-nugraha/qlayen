<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['event_id', 'delivery_id', 'event_status', 'payload'])]
class WhatsAppWebhookEvent extends Model
{
    protected $table = 'whatsapp_webhook_events';

    /**
     * @return BelongsTo<CustomerFollowUpDelivery, $this>
     */
    public function delivery(): BelongsTo
    {
        return $this->belongsTo(CustomerFollowUpDelivery::class, 'delivery_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['payload' => 'array'];
    }
}
