<?php

namespace App\Http\Controllers\Workspaces;

use App\Http\Controllers\Controller;
use App\Infrastructure\Messaging\WhatsAppGateway;
use App\Models\Workspace;
use App\Support\WorkspaceContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class WhatsAppSettingsController extends Controller
{
    public function index(Request $request, WorkspaceContext $context): Response
    {
        $workspace = $context->resolve($request, $request->query('workspace_id'));
        $this->authorizeManager($request, $workspace);

        return Inertia::render('whatsapp/settings', [
            'workspaces' => $request->user()->workspaces()->orderBy('workspaces.name')->get()
                ->map(fn (Workspace $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
            'currentWorkspaceId' => $workspace->id,
            'sender' => $workspace->wa_gateway_sender,
            'hasApiKey' => filled($workspace->wa_gateway_api_key),
            'gatewayUrl' => 'https://wa.digitalpelajar.id',
        ]);
    }

    public function update(Request $request, WorkspaceContext $context): RedirectResponse
    {
        $workspace = $context->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($request, $workspace);

        $data = $request->validate([
            'api_key' => ['nullable', 'string', 'max:500'],
            'sender' => ['required', 'string', 'regex:/^[0-9]{8,15}$/'],
            'workspace_id' => ['required', 'integer'],
        ]);

        $updates = ['wa_gateway_sender' => $data['sender']];
        if (filled($data['api_key'] ?? null)) {
            $updates['wa_gateway_api_key'] = $data['api_key'];
        }
        $workspace->update($updates);

        return to_route('whatsapp.settings', ['workspace_id' => $workspace->id])
            ->with('success', 'Pengaturan WhatsApp berhasil disimpan.');
    }

    public function qr(Request $request, WorkspaceContext $context, WhatsAppGateway $gateway): JsonResponse
    {
        $workspace = $context->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($request, $workspace);

        if (blank($workspace->wa_gateway_api_key) || blank($workspace->wa_gateway_sender)) {
            return response()->json(['status' => 'error', 'message' => 'Simpan API key dan nomor perangkat terlebih dahulu.'], 422);
        }

        try {
            $result = $gateway->generateQr($workspace);
            $message = strtolower((string) ($result['msg'] ?? $result['message'] ?? ''));
            if (str_contains($message, 'already connected')) {
                return response()->json(['status' => 'connected', 'message' => 'Perangkat WhatsApp sudah terhubung.']);
            }

            if (isset($result['qrcode']) && is_string($result['qrcode']) && str_starts_with($result['qrcode'], 'data:image/')) {
                return response()->json(['status' => 'qr', 'qrcode' => $result['qrcode'], 'message' => $result['message'] ?? 'Pindai QR dari WhatsApp.']);
            }

            if (($result['status'] ?? null) === 'processing') {
                return response()->json(['status' => 'processing', 'message' => $result['message'] ?? 'Menunggu QR dari gateway.']);
            }

            return response()->json(['status' => 'waiting', 'message' => $result['msg'] ?? $result['message'] ?? 'Gateway belum mengembalikan QR.']);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['status' => 'error', 'message' => 'Gateway tidak dapat dihubungi. Periksa API key, nomor perangkat, dan koneksi server.'], 502);
        }
    }

    public function test(Request $request, WorkspaceContext $context, WhatsAppGateway $gateway): JsonResponse
    {
        $workspace = $context->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($request, $workspace);
        $data = $request->validate([
            'workspace_id' => ['required', 'integer'],
            'number' => ['required', 'string', 'regex:/^[0-9]{8,15}$/'],
        ]);

        try {
            $result = $gateway->sendMessage($workspace, $data['number'], 'Tes koneksi WhatsApp dari QLayen. Jika pesan ini diterima, konfigurasi gateway berhasil.');
            if (($result['status'] ?? false) !== true) {
                return response()->json(['status' => 'error', 'message' => $result['msg'] ?? 'Gateway menolak pengiriman pesan.'], 422);
            }

            return response()->json(['status' => 'success', 'message' => $result['msg'] ?? 'Pesan tes diterima gateway.']);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['status' => 'error', 'message' => 'Pengiriman gagal. Periksa konfigurasi gateway dan log server.'], 502);
        }
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
