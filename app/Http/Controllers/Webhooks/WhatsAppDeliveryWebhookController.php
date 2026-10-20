<?php

namespace App\\Http\\Controllers\\Webhooks;

use App\\Http\\Controllers\\Controller;
use App\\Models\\CustomerFollowUpDelivery;
use App\\Models\\WhatsAppWebhookEvent;
use App\\Models\\WhatsAppWebhookEvent;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Validation\\Rule;

class WhatsAppDeliveryWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) config('services.wa_gateway.webhook_secret');
        $providedSecret = (string) $request->header('X-WA-Webhook-Secret', '');

        if ($secret === '' || $providedSecret === '' || ! hash_equals($secret, $providedSecret)) {
            return response()->json(['message' => 'Unauthorized webhook.'], 401);
        }

        $validated = $request->validate([
            'event_id' => ['required', 'string', 'max:191'],
            'delivery_id' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', Rule::in(['delivered', 'read', 'failed'])],
            'provider_message_id' => ['nullable', 'string', 'max:191'],
            'error' => ['nullable', 'string', 'max:2000'],
        ]);

        $result = DB::transaction(function () use ($validated): string {
            $event = WhatsAppWebhookEvent::query()
                ->where('event_id', $validated['event_id'])
                ->first();

            if ($event !== null) {
                return 'duplicate';
            }

            $delivery = CustomerFollowUpDelivery::query()
                ->lockForUpdate()
                ->find($validated['delivery_id']);

            if ($delivery === null) {
                return 'unknown_delivery';
            }

            WhatsAppWebhookEvent::query()->create([
                'event_id' => $validated['event_id'],
                'delivery_id' => $delivery->id,
                'event_status' => $validated['status'],
                'payload' => $validated,
            ]);

            $updates = [];
            if (! empty($validated['provider_message_id']) && empty($delivery->provider_message_id)) {
                $updates['provider_message_id'] = $validated['provider_message_id'];
            }

            if ($validated['status'] === 'delivered' && $delivery->delivered_at === null) {
                $updates['delivered_at'] = now();
                if (! in_array($delivery->status, ['read', 'failed', 'skipped'], true)) {
                    $updates['status'] = 'delivered';
                }
            } elseif ($validated['status'] === 'read') {
                $updates['read_at'] = $delivery->read_at ?? now();
                $updates['delivered_at'] = $delivery->delivered_at ?? now();
                if (! in_array($delivery->status, ['failed', 'skipped'], true)) {
                    $updates['status'] = 'read';
                }
            } elseif ($validated['status'] === 'failed' && ! in_array($delivery->status, ['delivered', 'read', 'skipped'], true)) {
                $updates['status'] = 'failed';
                $updates['last_error'] = $validated['error'] ?? 'Provider reported message delivery failure.';
            }

            if ($updates !== []) {
                $delivery->forceFill($updates)->save();
            }

            return 'processed';
        });

        return response()->json(['result' => $result], $result === 'unknown_delivery' ? 404 : 200);
    }
}
