<?php

namespace App\Http\Controllers;

use App\Models\CustomerCommunicationConsent;
use App\Support\WorkspaceContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunicationConsentController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));

        $consents = CustomerCommunicationConsent::query()
            ->where('workspace_id', $workspace->id)
            ->with(['customer:id,name', 'recordedBy:id,name'])
            ->orderByDesc('recorded_at')
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (CustomerCommunicationConsent $consent) => [
                'id' => $consent->id,
                'channel' => $consent->channel,
                'status' => $consent->status,
                'source' => $consent->source,
                'notice_version' => $consent->notice_version,
                'recorded_at' => $consent->recorded_at->toIso8601String(),
                'customer' => data_get($consent, 'customer.name', 'Deleted customer'),
                'recorded_by' => data_get($consent, 'recordedBy.name', 'Former user'),
            ]);

        return Inertia::render('communication-consents/index', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
            ],
            'workspaces' => $request->user()->workspaces()
                ->orderBy('workspaces.name')
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
            'consents' => $consents,
        ]);
    }
}
