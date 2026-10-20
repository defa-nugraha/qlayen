<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $user_id
 * @property string $role
 */
#[Fillable(['workspace_id', 'user_id', 'role'])]
class WorkspaceMembership extends Pivot
{
    protected $table = 'workspace_user';
}
