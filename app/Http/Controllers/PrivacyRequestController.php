<?php

namespace App\Http\Controllers;

use App\Models\PrivacyRequest;
use App\Support\AuditLogger;
use App\Support\WorkspaceContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PrivacyRequestController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): InertiaResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));

        $requests = PrivacyRequest::query()
            ->where('workspace_id', $workspace->id)
            ->with(['customer:id,name', 'requestedBy:id,name', 'resolvedBy:id,name'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PrivacyRequest $item) => [
                'id' => $item->id,
                'request_type' => $item->request_type,
                'status' => $item->status,
                'details' => $item->details,
                'resolution_note' => $item->resolution_note,
                'created_at' => $item->created_at?->toIso8601String(),
                'resolved_at' => $item->resolved_at?->toIso8601String(),
                'customer' => $item->customer?->name,
                'requested_by' => data_get($item, 'requestedBy.name', 'Former user'),
                'resolved_by' => $item->resolvedBy?->name,
            ]);

        return Inertia::render('privacy-requests/index', [
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
            'customers' => $workspace->customers()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($customer) => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                ]),
            'requests' => $requests,
            'canResolve' => in_array(
                $request->user()->workspaces()->whereKey($workspace->id)->firstOrFail()->pivot->role,
                ['owner', 'admin'],
                true,
            ),
        ]);
    }

    public function store(
        Request $request,
        WorkspaceContext $workspaceContext,
        AuditLogger $auditLogger,
    ): RedirectResponse {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('workspace_id', $workspace->id)],
            'request_type' => ['required', Rule::in(['access', 'correction', 'deletion'])],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);

        $privacyRequest = PrivacyRequest::query()->create([
            'workspace_id' => $workspace->id,
            'customer_id' => $validated['customer_id'] ?? null,
            'requested_by_user_id' => $request->user()->id,
            'request_type' => $validated['request_type'],
            'status' => 'pending',
            'details' => $validated['details'] ?? null,
        ]);

        $auditLogger->record($request, $workspace, 'privacy_request.created', 'privacy_request', $privacyRequest->id, [
            'request_type' => $privacyRequest->request_type,
        ]);

        return to_route('privacy-requests.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Privacy request recorded.');
    }

    public function update(
        Request $request,
        string $privacyRequest,
        WorkspaceContext $workspaceContext,
        AuditLogger $auditLogger,
    ): RedirectResponse {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $membership = $request->user()->workspaces()
            ->whereKey($workspace->id)
            ->firstOrFail();
        abort_unless(in_array($membership->pivot->role, ['owner', 'admin'], true), 403);

        $record = PrivacyRequest::query()
            ->where('workspace_id', $workspace->id)
            ->findOrFail($privacyRequest);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['in_review', 'completed', 'rejected'])],
            'resolution_note' => ['nullable', 'string', 'max:2000', 'required_if:status,rejected'],
        ]);

        $resolved = in_array($validated['status'], ['completed', 'rejected'], true);
        $record->update([
            'status' => $validated['status'],
            'resolution_note' => $validated['resolution_note'] ?? null,
            'resolved_by_user_id' => $resolved ? $request->user()->id : null,
            'resolved_at' => $resolved ? now() : null,
        ]);

        $auditLogger->record($request, $workspace, 'privacy_request.status_changed', 'privacy_request', $record->id, [
            'status' => $record->status,
        ]);

        return to_route('privacy-requests.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Privacy request updated.');
    }
}
