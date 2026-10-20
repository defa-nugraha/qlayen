<?php

namespace App\\Http\\Controllers\\Customers;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Workspace;
use App\\Support\\WorkspaceContext;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Http\\Request;
use Inertia\\Inertia;
use Inertia\\Response;

class FollowUpController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $filter = (string) $request->query('filter', 'upcoming');
        abort_unless(in_array($filter, ['overdue', 'today', 'upcoming', 'all'], true), 422);
        $search = trim((string) $request->query('search', ''));
        $today = now()->startOfDay();
        $tomorrow = $today->copy()->addDay();

        $baseQuery = $workspace->customers()
            ->whereNotNull('follow_up_at')
            ->where('status', 'active');

        $counts = [
            'overdue' => (clone $baseQuery)->where('follow_up_at', '<', $today)->count(),
            'today' => (clone $baseQuery)->where('follow_up_at', '>=', $today)->where('follow_up_at', '<', $tomorrow)->count(),
            'upcoming' => (clone $baseQuery)->where('follow_up_at', '>=', $tomorrow)->count(),
        ];

        $customers = (clone $baseQuery)
            ->when($filter === 'overdue', fn (Builder $query) => $query->where('follow_up_at', '<', $today))
            ->when($filter === 'today', fn (Builder $query) => $query->where('follow_up_at', '>=', $today)->where('follow_up_at', '<', $tomorrow))
            ->when($filter === 'upcoming', fn (Builder $query) => $query->where('follow_up_at', '>=', $tomorrow))
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('follow_up_notes', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('follow_up_at')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('follow-ups/index', [
            'customers' => $customers,
            'filters' => ['filter' => $filter, 'search' => $search],
            'counts' => $counts,
            'workspaces' => $request->user()->workspaces()
                ->orderBy('workspaces.name')
                ->get()
                ->map(fn (Workspace $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
            'currentWorkspaceId' => $workspace->id,
        ]);
    }
}
