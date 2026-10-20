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
 * @property int|null $recorded_by_user_id
 * @property string $channel
 * @property string $status
 * @property string $source
 * @property string|null $notice_version
 * @property Carbon $recorded_at
 * @property Carbon|null $created_at
 */
#[Fillable([
    'workspace_id',
    'customer_id',
    'recorded_by_user_id',
    'channel',
    'status',
    'source',
    'notice_version',
    'recorded_at',
])]
class CustomerCommunicationConsent extends Model
{
    public $timestamps = false;

    protected $table = 'customer_communication_consents';

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
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }
}
