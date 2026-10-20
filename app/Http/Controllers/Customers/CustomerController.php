<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use App\Support\WorkspaceContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $search = trim((string) $request->query('search', ''));

        $customers = $workspace->customers()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderByRaw('CASE WHEN follow_up_at IS NULL THEN 1 ELSE 0 END')
            ->orderBy('follow_up_at')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => ['search' => $search],
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

    public function store(Request $request, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));

        $workspace->customers()->create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return to_route('customers.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, string $customer, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $record = $workspace->customers()->findOrFail($customer);
        $validated = $request->validate($this->rules());

        if (($validated['follow_up_at'] ?? null) !== null) {
            $validated['follow_up_completed_at'] = null;
        }

        $record->update($validated);

        return to_route('customers.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Request $request, string $customer, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $workspace->customers()->findOrFail($customer)->delete();

        return to_route('customers.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Customer deleted successfully.');
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'source' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'follow_up_at' => ['nullable', 'date'],
            'follow_up_notes' => ['nullable', 'string', 'max:10000'],
            'follow_up_whatsapp_enabled' => ['sometimes', 'boolean'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
