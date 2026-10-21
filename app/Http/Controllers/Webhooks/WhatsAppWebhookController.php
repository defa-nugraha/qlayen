<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\ActivationQrCode;
use App\Models\Customer;
use App\Models\QlayenSetting;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WhatsAppWebhookController extends Controller
{
    public function incoming(Request $request): JsonResponse
    {
        $secret = (string) config('services.wa_gateway.webhook_secret');

        abort_if($secret === '', 503, 'WhatsApp webhook secret is not configured.');

        $providedSecret = (string) ($request->header('X-QLayen-Webhook-Secret') ?: $request->input('webhook_secret', ''));
        abort_unless(hash_equals($secret, $providedSecret), 401, 'Invalid webhook secret.');

        $payload = $request->validate([
            'message' => ['required', 'string', 'max:10000'],
            'from' => ['required', 'string', 'max:64'],
            'bufferImage' => ['nullable', 'string', 'max:12000000'],
        ]);

        $phone = preg_replace('/\D+/', '', $payload['from']) ?? '';
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }
        if (strlen($phone) < 8 || strlen($phone) > 15) {
            return response()->json(['status' => 'ignored', 'reason' => 'invalid_sender'], 202);
        }

        $settings = QlayenSetting::read('whatsapp_capture', []);
        if (($settings['mode'] ?? config('qlayen.whatsapp_capture_mode', 'form')) !== 'webhook') {
            return response()->json(['status' => 'ignored', 'reason' => 'webhook_mode_disabled'], 202);
        }

        $settings = QlayenSetting::read('whatsapp_capture', []);
        if (($settings['mode'] ?? config('qlayen.whatsapp_capture_mode', 'form')) !== 'webhook') {
            return response()->json(['status' => 'ignored', 'reason' => 'webhook_mode_disabled'], 202);
        }

        $message = trim($payload['message']);
        $activationCode = null;
        if (preg_match('/QLY-([A-Za-z0-9]{20,64})/', $message, $matches) === 1) {
            $activationCode = $matches[1];
        }

        $query = ActivationQrCode::query()->where('status', 'active');
        if ($activationCode !== null) {
            $query->where('token', $activationCode);
        } else {
            $sender = (string) config('services.wa_gateway.sender');
            if ($sender === '') {
                return response()->json(['status' => 'ignored', 'reason' => 'activation_reference_required'], 202);
            }

            // An unreferenced inbound message is only accepted when one active QR
            // is unambiguously mapped to the configured gateway sender.
            $query->whereHas('workspace', fn ($workspaceQuery) => $workspaceQuery->where('wa_gateway_sender', $sender));
            if ($query->count() !== 1) {
                return response()->json(['status' => 'ignored', 'reason' => 'activation_reference_required'], 202);
            }
            if ($query->count() !== 1) {
                return response()->json(['status' => 'ignored', 'reason' => 'activation_reference_required'], 202);
            }
        }

        $code = $query->first();
        if ($code === null || $code->workspace_id === null) {
            return response()->json(['status' => 'ignored', 'reason' => 'activation_qr_not_found'], 202);
        }

        $workspace = Workspace::query()->find($code->workspace_id);
        if ($workspace === null) {
            return response()->json(['status' => 'ignored', 'reason' => 'workspace_not_found'], 202);
        }

        $userId = (int) ($code->activated_by_user_id ?: $workspace->owner_id);

        DB::transaction(function () use ($workspace, $userId, $phone, $message): void {
            $customer = Customer::query()
                ->where('workspace_id', $workspace->id)
                ->where('phone', $phone)
                ->first();

            if ($customer === null) {
                $customer = $workspace->customers()->create([
                    'user_id' => $userId,
                    'name' => $phone,
                    'phone' => $phone,
                    'source' => 'WHATSAPP',
                    'status' => 'active',
                    // An inbound message identifies a contact; it is not consent
                    // to receive marketing campaigns.
                    'consent_at' => null,
                    'whatsapp_consent_at' => null,
                ]);
            }

            if ($customer->wasRecentlyCreated) {
                $customer->update([
                    'notes' => 'Pesan pertama masuk melalui WhatsApp: '.Str::limit($message, 1500),
                ]);
            }
        });

        return response()->json(['status' => 'received'], 202);
    }
}
