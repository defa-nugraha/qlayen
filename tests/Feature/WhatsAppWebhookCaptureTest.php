<?php

use App\Models\ActivationQrCode;
use App\Models\Customer;
use App\Models\QlayenSetting;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Str;

function createActiveQrForWebhook(): ActivationQrCode
{
    $owner = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Webhook workspace',
        'wa_gateway_sender' => '628111111111',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    return ActivationQrCode::query()->create([
        'generated_by_user_id' => $owner->id,
        'generated_workspace_id' => $workspace->id,
        'workspace_id' => $workspace->id,
        'activated_by_user_id' => $owner->id,
        'name' => 'Webhook QR',
        'token' => Str::random(48),
        'status' => 'active',
        'activated_at' => now(),
    ]);
}

it('records an inbound WhatsApp sender against an activation QR workspace', function () {
    config(['services.wa_gateway.webhook_secret' => 'test-secret']);
    QlayenSetting::write('whatsapp_capture', [
        'mode' => 'webhook',
        'message_template' => 'Halo. Kode: QLY-{token}',
    ]);
    $code = createActiveQrForWebhook();

    $this->postJson(route('whatsapp.webhook.incoming', ['secret' => 'test-secret']), [
        'message' => 'Halo, saya ingin terhubung. Kode: QLY-'.$code->token,
        'from' => '6281234567890',
        'bufferImage' => null,
    ], ['X-QLayen-Webhook-Secret' => 'test-secret'])->assertAccepted()->assertJson(['status' => 'received']);

    $customer = Customer::query()->where('workspace_id', $code->workspace_id)->where('phone', '6281234567890')->first();

    expect($customer)->not->toBeNull()
        ->and($customer->source)->toBe('WHATSAPP')
        ->and($customer->consent_at)->toBeNull()
        ->and($customer->whatsapp_consent_at)->toBeNull();
});

it('rejects inbound webhook calls with an invalid secret', function () {
    config(['services.wa_gateway.webhook_secret' => 'test-secret']);

    $this->postJson(route('whatsapp.webhook.incoming', ['secret' => 'wrong-secret']), [
        'message' => 'Hello',
        'from' => '6281234567890',
        'bufferImage' => null,
    ])->assertUnauthorized();
});
