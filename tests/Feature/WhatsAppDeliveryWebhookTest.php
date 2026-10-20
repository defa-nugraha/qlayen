<?php

use App\Models\CustomerFollowUpDelivery;
use App\Models\Customer;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WhatsAppWebhookEvent;

function makeWebhookDelivery(array $overrides = []): CustomerFollowUpDelivery
{
    $user = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $user->id,
        'name' => 'Webhook workspace',
    ]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'name' => 'Webhook Customer',
        'phone' => '628123456789',
        'status' => 'active',
        'follow_up_at' => now()->subMinute(),
        'follow_up_whatsapp_enabled' => true,
        'consent_at' => now()->subDay(),
        'whatsapp_consent_at' => now()->subDay(),
    ]);

    return CustomerFollowUpDelivery::query()->create([
        'workspace_id' => $workspace->id,
        'customer_id' => $customer->id,
        'scheduled_for' => $customer->follow_up_at,
        'status' => 'accepted',
        'accepted_at' => now(),
        ...$overrides,
    ]);
}

beforeEach(function () {
    config(['services.wa_gateway.webhook_secret' => 'test-webhook-secret']);
});

it('rejects webhook requests without the configured secret', function () {
    $this->postJson('/webhooks/whatsapp/delivery', [
        'event_id' => 'evt-1',
        'delivery_id' => 1,
        'status' => 'delivered',
    ])->assertUnauthorized();

    expect(WhatsAppWebhookEvent::query()->count())->toBe(0);
});

it('records delivery status and ignores duplicate event identifiers', function () {
    $delivery = makeWebhookDelivery();
    $payload = [
        'event_id' => 'evt-delivered-1',
        'delivery_id' => $delivery->id,
        'status' => 'delivered',
        'provider_message_id' => 'provider-message-123',
    ];

    $this->withHeader('X-WA-Webhook-Secret', 'test-webhook-secret')
        ->postJson('/webhooks/whatsapp/delivery', $payload)
        ->assertOk()
        ->assertJsonPath('result', 'processed');

    $this->withHeader('X-WA-Webhook-Secret', 'test-webhook-secret')
        ->postJson('/webhooks/whatsapp/delivery', $payload)
        ->assertOk()
        ->assertJsonPath('result', 'duplicate');

    expect($delivery->fresh()->status)->toBe('delivered')
        ->and($delivery->fresh()->provider_message_id)->toBe('provider-message-123')
        ->and($delivery->fresh()->delivered_at)->not->toBeNull()
        ->and(WhatsAppWebhookEvent::query()->count())->toBe(1);
});

it('does not downgrade a read delivery when a late delivered event arrives', function () {
    $delivery = makeWebhookDelivery(['status' => 'read', 'delivered_at' => now(), 'read_at' => now()]);

    $this->withHeader('X-WA-Webhook-Secret', 'test-webhook-secret')
        ->postJson('/webhooks/whatsapp/delivery', [
            'event_id' => 'evt-late-delivered',
            'delivery_id' => $delivery->id,
            'status' => 'delivered',
        ])->assertOk();

    expect($delivery->fresh()->status)->toBe('read')
        ->and($delivery->fresh()->read_at)->not->toBeNull();
});

it('returns not found for unknown delivery ids without recording the event', function () {
    $this->withHeader('X-WA-Webhook-Secret', 'test-webhook-secret')
        ->postJson('/webhooks/whatsapp/delivery', [
            'event_id' => 'evt-unknown',
            'delivery_id' => 999999,
            'status' => 'delivered',
        ])->assertNotFound();

    expect(WhatsAppWebhookEvent::query()->count())->toBe(0);
});
