<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Support\AuditLogger;
use App\Support\WorkspaceContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerInteractionController extends Controller
{
    public function index(
        Request $request,
        string $customer,
        WorkspaceContext $workspaceContext,
    ): Response {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $record = $workspace->customers()->findOrFail($customer);

        return Inertia::render('customers/interactions/index', [
            'customer' => $record->only(['id', 'name', 'phone', 'email']),
            'workspaceId' => $workspace->id,
            'interactions' => $record->interactions()
                ->with('user:id,name')
                ->orderByDesc('occurred_at')
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function store(
        Request $request,
        string $customer,
        WorkspaceContext $workspaceContext,
        AuditLogger $auditLogger,
    ): RedirectResponse {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $record = $workspace->customers()->findOrFail($customer);

        $validated = $request->validate([
            'workspace_id' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:note,call,message,purchase,other'],
            'summary' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:5000'],
            'occurred_at' => ['required', 'date'],
        ]);

        $interaction = $record->interactions()->create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'summary' => $validated['summary'],
            'details' => $validated['details'] ?? null,
            'occurred_at' => $validated['occurred_at'],
        ]);

        $auditLogger->record($request, $workspace, 'customer.interaction_recorded', 'customer_interaction', $interaction->id, [
            'type' => $interaction->type,
        ]);

        return to_route('customers.interactions.index', [
            'customer' => $record->id,
            'workspace_id' => $workspace->id,
        ])->with('success', 'Interaction recorded successfully.');
    }
}
