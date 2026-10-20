<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $customer_id
 * @property Carbon $scheduled_for
 * @property string $status
 * @property int $attempts
 * @property Carbon|null $sent_at
 * @property array<string, mixed>|null $provider_response
 * @property string|null $last_error
 */
#[Fillable([
    'workspace_id',
    'customer_id',
    'scheduled_for',
    'status',
    'attempts',
    'sent_at',
    'provider_response',
    'last_error',
])]
class CustomerFollowUpDelivery extends Model
{
    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_for' => 'datetime',
            'sent_at' => 'datetime',
            'provider_response' => 'array',
            'attempts' => 'integer',
        ];
    }
}
