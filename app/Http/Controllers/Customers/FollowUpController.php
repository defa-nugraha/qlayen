<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Jobs\SendCustomerFollowUpWhatsApp;
use App\Models\CustomerFollowUpDelivery;
use App\Models\Workspace;
use App\Support\AuditLogger;
use App\Support\WorkspaceContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
            ->where('status', 'active')
            ->whereNull('follow_up_completed_at');

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

        $deliveryBySchedule = CustomerFollowUpDelivery::query()
            ->whereIn('customer_id', $customers->getCollection()->pluck('id'))
            ->get()
            ->keyBy(fn (CustomerFollowUpDelivery $delivery): string => $delivery->customer_id.'|'.$delivery->scheduled_for->toDateTimeString());

        $customers->getCollection()->transform(function ($customer) use ($deliveryBySchedule) {
            $key = $customer->id.'|'.$customer->follow_up_at->toDateTimeString();
            $delivery = $deliveryBySchedule->get($key);

            $customer->setAttribute('whatsapp_delivery', $delivery === null ? null : [
                'id' => $delivery->id,
                'status' => $delivery->status,
                'attempts' => $delivery->attempts,
                'last_error' => $delivery->last_error,
                'retryable' => $delivery->status === 'failed',
            ]);

            return $customer;
        });

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

    public function retryDelivery(Request $request, string $delivery, WorkspaceContext $workspaceContext, AuditLogger $auditLogger): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));

        $record = CustomerFollowUpDelivery::query()
            ->where('workspace_id', $workspace->id)
            ->with('customer')
            ->findOrFail($delivery);

        abort_unless($record->status === 'failed', 422, 'Only failed WhatsApp deliveries can be retried.');

        $customer = $record->customer;

        abort_unless(
            $customer !== null
            && $customer->workspace_id === $workspace->id
            && $customer->status === 'active'
            && $customer->follow_up_completed_at === null
            && $customer->follow_up_whatsapp_enabled
            && $customer->whatsapp_consent_at !== null
            && filled($customer->phone)
            && $customer->follow_up_at !== null
            && $customer->follow_up_at->equalTo($record->scheduled_for),
            422,
            'This customer is no longer eligible for WhatsApp follow-up. Review consent and follow-up settings first.',
        );

        $updated = CustomerFollowUpDelivery::query()
            ->whereKey($record->id)
            ->where('workspace_id', $workspace->id)
            ->where('status', 'failed')
            ->update([
                'status' => 'pending',
                'last_error' => null,
                'updated_at' => now(),
            ]);

        if ($updated === 1) {
            SendCustomerFollowUpWhatsApp::dispatch($record->id);
            $auditLogger->record($request, $workspace, 'whatsapp_delivery.retry_requested', 'follow_up_delivery', $record->id);
        }

        return to_route('follow-ups.index', [
            'workspace_id' => $workspace->id,
            'filter' => $request->input('filter', 'upcoming'),
            'search' => $request->input('search'),
        ])->with('success', $updated === 1
            ? 'Failed WhatsApp delivery queued for retry.'
            : 'This delivery has already been updated and was not queued again.');
    }

    public function complete(Request $request, string $customer, WorkspaceContext $workspaceContext, AuditLogger $auditLogger): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $record = $workspace->customers()
            ->where('status', 'active')
            ->whereNotNull('follow_up_at')
            ->findOrFail($customer);

        if ($record->follow_up_completed_at === null) {
            $record->update(['follow_up_completed_at' => now()]);
            $auditLogger->record($request, $workspace, 'follow_up.completed', 'customer', $record->id);
        }

        return to_route('follow-ups.index', [
            'workspace_id' => $workspace->id,
            'filter' => $request->input('filter', 'upcoming'),
            'search' => $request->input('search'),
        ])->with('success', 'Follow-up marked as completed.');
    }
}
