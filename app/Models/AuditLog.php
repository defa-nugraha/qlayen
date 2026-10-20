<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int|null $actor_user_id
 * @property string $event
 * @property string $subject_type
 * @property int|null $subject_id
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $created_at
 */
#[Fillable([
    'workspace_id',
    'actor_user_id',
    'event',
    'subject_type',
    'subject_id',
    'metadata',
])]
class AuditLog extends Model
{
    public $timestamps = false;

    protected $table = 'audit_logs';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
