<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;

class AuditLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function record(
        Request $request,
        Workspace $workspace,
        string $event,
        string $subjectType,
        ?int $subjectId = null,
        array $metadata = [],
    ): void {
        /** @var User|null $actor */
        $actor = $request->user();

        AuditLog::query()->create([
            'workspace_id' => $workspace->id,
            'actor_user_id' => $actor?->id,
            'event' => $event,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'metadata' => $metadata === [] ? null : $metadata,
        ]);
    }
}
