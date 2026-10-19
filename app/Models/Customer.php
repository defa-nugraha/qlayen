<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $source
 * @property string|null $notes
 * @property Carbon|null $follow_up_at
 * @property string|null $follow_up_notes
 * @property string $status
 * @property Carbon|null $consent_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'name',
    'phone',
    'email',
    'source',
    'notes',
    'follow_up_at',
    'follow_up_notes',
    'status',
    'consent_at',
])]
class Customer extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'follow_up_at' => 'datetime',
            'consent_at' => 'datetime',
        ];
    }
}
