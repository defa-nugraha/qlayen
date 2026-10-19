<?php

namespace App\Support;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkspaceContext
{
    public function resolve(Request $request, mixed $workspaceId = null): Workspace
    {
        /** @var User $user */
        $user = $request->user();

        if ($workspaceId !== null && $workspaceId !== '') {
            abort_unless(
                is_numeric($workspaceId) && (string) (int) $workspaceId === (string) $workspaceId,
                404,
            );

            return $user->workspaces()
                ->whereKey((int) $workspaceId)
                ->firstOrFail();
        }

        $workspace = $user->workspaces()
            ->orderBy('workspaces.id')
            ->first();

        if ($workspace !== null) {
            return $workspace;
        }

        return DB::transaction(function () use ($user): Workspace {
            $workspace = $user->ownedWorkspaces()->create([
                'name' => mb_substr($user->name . "'s workspace", 0, 120),
                'description' => 'Default workspace',
            ]);

            $workspace->members()->attach($user->id, ['role' => 'owner']);

            return $workspace;
        });
    }
}
