<?php

namespace App\Http\Controllers\Workspaces;

use App\Http\Controllers\Controller;
use App\Jobs\SendWhatsAppCampaignMessage;
use App\Models\Workspace;
use App\Support\WorkspaceContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppCampaignController extends Controller
{
    public function index(Request $request, WorkspaceContext $context): Response
    {
        $workspace = $context->resolve($request, $request->query('workspace_id'));
        $this->authorizeManager($request, $workspace);

        return Inertia::render('whatsapp/campaigns', [
            'workspaces' => $request->user()->workspaces()->orderBy('workspaces.name')->get()
                ->map(fn (Workspace $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
            'currentWorkspaceId' => $workspace->id,
            'eligibleCount' => $workspace->customers()
                ->where('status', 'active')
                ->whereNotNull('whatsapp_consent_at')
                ->whereNotNull('phone')
                ->where('phone', '!=', '')
                ->count(),
            'configured' => filled($workspace->wa_gateway_api_key) && filled($workspace->wa_gateway_sender),
        ]);
    }

    public function store(Request $request, WorkspaceContext $context): RedirectResponse
    {
        $workspace = $context->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($request, $workspace);

        $data = $request->validate([
            'workspace_id' => ['required', 'integer'],
            'name' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:4096'],
        ]);

        abort_unless(filled($workspace->wa_gateway_api_key) && filled($workspace->wa_gateway_sender), 422, 'Konfigurasi WhatsApp gateway belum lengkap.');

        $customerIds = $workspace->customers()
            ->where('status', 'active')
            ->whereNotNull('whatsapp_consent_at')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->orderBy('id')
            ->pluck('id');

        if ($customerIds->isEmpty()) {
            return to_route('whatsapp.campaigns', ['workspace_id' => $workspace->id])
                ->with('success', 'Tidak ada kontak aktif dengan persetujuan WhatsApp untuk menerima kampanye.');
        }

        foreach ($customerIds as $customerId) {
            SendWhatsAppCampaignMessage::dispatch($workspace->id, (int) $customerId, $data['message']);
        }

        return to_route('whatsapp.campaigns', ['workspace_id' => $workspace->id])
            ->with('success', 'Kampanye "'.$data['name'].'" dimasukkan ke antrean untuk '.$customerIds->count().' kontak yang telah memberikan persetujuan.');
    }

    private function authorizeManager(Request $request, Workspace $workspace): void
    {
        $role = DB::table('workspace_user')
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $request->user()->id)
            ->value('role');

        abort_unless(in_array($role, ['owner', 'admin'], true), 403);
    }
}
