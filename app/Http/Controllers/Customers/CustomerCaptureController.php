<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Infrastructure\Messaging\WhatsAppGateway;
use App\Models\CustomerCaptureLink;
use App\Models\Workspace;
use App\Support\WorkspaceContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CustomerCaptureController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));

        $links = $workspace->customerCaptureLinks()
            ->latest()
            ->get()
            ->map(fn (CustomerCaptureLink $link) => [
                'id' => $link->id,
                'name' => $link->name,
                'source' => $link->source,
                'is_active' => $link->is_active,
                'url' => route('capture.show', $link->token),
                'created_at' => $link->created_at?->toIso8601String(),
            ]);

        return Inertia::render('capture/index', [
            'links' => $links,
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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'source' => ['required', 'in:qr,nfc'],
        ]);
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($request, $workspace);

        $workspace->customerCaptureLinks()->create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'source' => $validated['source'],
            'token' => Str::random(48),
            'is_active' => true,
        ]);

        return to_route('capture.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Capture link created.');
    }

    public function toggle(Request $request, int $captureLink, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $link = $workspace->customerCaptureLinks()->findOrFail($captureLink);
        $this->authorizeManager($request, $workspace);
        $link->update(['is_active' => ! $link->is_active]);

        return to_route('capture.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Capture link status updated.');
    }

    private function authorizeManager(Request $request, Workspace $workspace): void
    {
        $role = DB::table('workspace_user')
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $request->user()->id)
            ->value('role');

        abort_unless(in_array($role, ['owner', 'admin'], true), 403);
    }

    public function show(string $token): Response
    {
        $link = CustomerCaptureLink::query()
            ->where('token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('capture/show', [
            'campaignName' => $link->name,
            'token' => $link->token,
        ]);
    }

    public function capture(Request $request, string $token, WhatsAppGateway $gateway): \\Symfony\\Component\\HttpFoundation\\Response
    {
        $link = CustomerCaptureLink::query()
            ->where('token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'consent' => ['accepted'],
        ]);

        $workspace = $link->workspace()->firstOrFail();
        $phone = preg_replace('/\D+/', '', $validated['phone']) ?? $validated['phone'];
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        $customer = $workspace->customers()->create([
            'user_id' => $link->user_id,
            'name' => $validated['name'],
            'phone' => $phone,
            'email' => $validated['email'] ?? null,
            'source' => Str::upper($link->source),
            'status' => 'active',
            'consent_at' => now(),
            'whatsapp_consent_at' => now(),
        ]);

        if (filled($workspace->wa_gateway_api_key) && filled($workspace->wa_gateway_sender)) {
            try {
                $gateway->sendMessageForWorkspace(
                    $workspace,
                    $customer->phone,
                    'Halo '.$customer->name.', terima kasih telah terhubung dengan kami melalui '.$link->name.'. Kami akan mengirim informasi yang relevan melalui WhatsApp sesuai persetujuan Anda.',
                );
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        if (filled($workspace->wa_gateway_sender)) {
            $prefill = rawurlencode('Halo, saya '.$customer->name.'. Saya baru saja scan QR '.$link->name.'.');
            return Inertia::location('https://wa.me/'.$workspace->wa_gateway_sender.'?text='.$prefill);
        }

        return to_route('capture.show', $token)
            ->with('success', 'Thank you. Your details have been submitted.');
    }
}
