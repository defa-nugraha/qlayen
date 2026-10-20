<?php

namespace App\Http\Controllers;

use App\Models\CustomerInteraction;
use App\Support\WorkspaceContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $today = now()->startOfDay();
        $tomorrow = $today->copy()->addDay();
        $monthStart = $today->copy()->subDays(29);

        $customers = $workspace->customers();
        $interactions = CustomerInteraction::query()
            ->whereHas('customer', fn ($query) => $query->where('workspace_id', $workspace->id));
        $followUps = $workspace->customers()
            ->whereNull('follow_up_completed_at')
            ->whereNotNull('follow_up_at');

        $recentInteractions = (clone $interactions)
            ->with(['customer:id,name', 'user:id,name'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (CustomerInteraction $interaction) => [
                'id' => $interaction->id,
                'type' => $interaction->type,
                'summary' => $interaction->summary,
                'occurred_at' => $interaction->occurred_at?->toIso8601String(),
                'customer' => $interaction->customer?->name,
                'actor' => $interaction->user?->name,
            ]);

        $dueFollowUps = (clone $followUps)
            ->where('follow_up_at', '<', $tomorrow)
            ->orderBy('follow_up_at')
            ->limit(5)
            ->get(['id', 'name', 'follow_up_at', 'follow_up_notes'])
            ->map(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'scheduled_at' => $customer->follow_up_at?->toIso8601String(),
                'notes' => $customer->follow_up_notes,
            ]);

        return Inertia::render('dashboard', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'role' => $workspace->pivot?->role,
            ],
            'metrics' => [
                'customers_total' => (clone $customers)->count(),
                'customers_active' => (clone $customers)->where('status', 'active')->count(),
                'interactions_last_30_days' => (clone $interactions)
                    ->where('occurred_at', '>=', $monthStart)
                    ->where('occurred_at', '<', $tomorrow)
                    ->count(),
                'capture_links_active' => $workspace->customerCaptureLinks()
                    ->where('is_active', true)
                    ->count(),
                'follow_ups_overdue' => (clone $followUps)
                    ->where('follow_up_at', '<', $today)
                    ->count(),
                'follow_ups_today' => (clone $followUps)
                    ->where('follow_up_at', '>=', $today)
                    ->where('follow_up_at', '<', $tomorrow)
                    ->count(),
            ],
            'recentInteractions' => $recentInteractions,
            'dueFollowUps' => $dueFollowUps,
            'definitions' => [
                'period' => $monthStart->toDateString().' — '.$today->toDateString(),
                'customers' => 'Distinct customer records in the selected workspace.',
                'interactions' => 'Interaction records with an occurrence date in the last 30 calendar days.',
                'capture_links' => 'Active QR/NFC capture links; this is not a scan count.',
                'follow_ups' => 'Scheduled follow-ups that have not been marked completed.',
            ],
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
