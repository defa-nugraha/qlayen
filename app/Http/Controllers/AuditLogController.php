<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\WorkspaceContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $membership = $request->user()->workspaces()
            ->whereKey($workspace->id)
            ->firstOrFail();

        abort_unless(in_array($membership->pivot->role, ['owner', 'admin'], true), 403);

        $logs = AuditLog::query()
            ->where('workspace_id', $workspace->id)
            ->with('actor:id,name')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'event' => $log->event,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at?->toIso8601String(),
                'actor' => $log->actor?->name ?? 'Former user',
            ]);

        return Inertia::render('audit-logs/index', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
            ],
            'logs' => $logs,
            'workspaces' => $request->user()->workspaces()
                ->orderBy('workspaces.name')
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
        ]);
    }
}
