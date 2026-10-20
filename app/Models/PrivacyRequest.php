<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int|null $customer_id
 * @property int|null $requested_by_user_id
 * @property int|null $resolved_by_user_id
 * @property string $request_type
 * @property string $status
 * @property string|null $details
 * @property string|null $resolution_note
 * @property Carbon|null $resolved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'workspace_id',
    'customer_id',
    'requested_by_user_id',
    'resolved_by_user_id',
    'request_type',
    'status',
    'details',
    'resolution_note',
    'resolved_at',
])]
class PrivacyRequest extends Model
{
    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['resolved_at' => 'datetime'];
    }
}
