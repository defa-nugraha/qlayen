<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $generated_by_user_id
 * @property int $generated_workspace_id
 * @property int|null $workspace_id
 * @property int|null $activated_by_user_id
 * @property string $name
 * @property string $token
 * @property string $foreground_color
 * @property string $background_color
 * @property string $frame_text
 * @property string $status
 * @property Carbon|null $activated_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'generated_by_user_id',
    'generated_workspace_id',
    'workspace_id',
    'activated_by_user_id',
    'name',
    'token',
    'foreground_color',
    'background_color',
    'frame_text',
    'status',
    'activated_at',
])]
class ActivationQrCode extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['activated_at' => 'datetime'];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function generatedWorkspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class, 'generated_workspace_id');
    }

    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function activatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by_user_id');
    }
}
