<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $owner_id
 * @property-read WorkspaceMembership $pivot
 * @property string $name
 * @property string|null $description
 * @property string|null $wa_gateway_api_key
 * @property string|null $wa_gateway_sender
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['owner_id', 'name', 'description', 'wa_gateway_api_key', 'wa_gateway_sender'])]
class Workspace extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    protected function casts(): array
    {
        return ['wa_gateway_api_key' => 'encrypted'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return HasMany<Customer, $this>
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * @return HasMany<CustomerCaptureLink, $this>
     */
    public function customerCaptureLinks(): HasMany
    {
        return $this->hasMany(CustomerCaptureLink::class);
    }

    /**
     * @return BelongsToMany<User, $this, WorkspaceMembership, 'pivot'>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->using(WorkspaceMembership::class)
            ->withPivot('role')
            ->withTimestamps();
    }
}
