<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable([
    'generated_by_user_id', 'generated_workspace_id', 'workspace_id',
    'activated_by_user_id', 'name', 'token', 'foreground_color',
    'background_color', 'frame_text', 'status', 'activated_at',
])]
class ActivationQrCode extends Model
{
    protected function casts(): array
    {
        return ['activated_at' => 'datetime'];
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    public function generatedWorkspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class, 'generated_workspace_id');
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function activatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by_user_id');
    }
}
