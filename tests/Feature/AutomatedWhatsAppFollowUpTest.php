<?php

use App\Infrastructure\Messaging\WhatsAppGateway;
use App\Jobs\SendCustomerFollowUpWhatsApp;
use App\Models\Customer;
use App\Models\CustomerFollowUpDelivery;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

function makeFollowUpCustomer(array $overrides = []): Customer
{
    $user = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $user->id,
        'name' => 'Test workspace',
    ]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    return Customer::query()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'name' => 'Ari Customer',
        'phone' => '628123456789',
        'status' => 'active',
        'follow_up_at' => now()->subMinute(),
        'follow_up_notes' => 'Please check the order status.',
        'follow_up_whatsapp_enabled' => true,
        'consent_at' => now()->subDay(),
        'whatsapp_consent_at' => now()->subDay(),
        ...$overrides,
    ]);
}

it('queues each eligible WhatsApp follow-up only once', function () {
    Queue::fake();
    $customer = makeFollowUpCustomer();

    $this->artisan('follow-ups:queue-whatsapp')->assertSuccessful();
    $this->artisan('follow-ups:queue-whatsapp')->assertSuccessful();

    expect(CustomerFollowUpDelivery::query()->count())->toBe(1);

    Queue::assertPushed(SendCustomerFollowUpWhatsApp::class, 1);
});

it('does not queue follow-ups without recorded consent or explicit opt-in', function () {
    Queue::fake();
    makeFollowUpCustomer(['whatsapp_consent_at' => null]);
    makeFollowUpCustomer(['follow_up_whatsapp_enabled' => false]);
    makeFollowUpCustomer(['phone' => null]);

    $this->artisan('follow-ups:queue-whatsapp')->assertSuccessful();

    expect(CustomerFollowUpDelivery::query()->count())->toBe(0);
    Queue::assertNothingPushed();
});

it('records gateway acceptance without duplicating a second send', function () {
    config([
        'services.wa_gateway.api_key' => 'test-key',
        'services.wa_gateway.sender' => 'test-sender',
        'services.wa_gateway.base_url' => 'https://gateway.test',
        'services.wa_gateway.timeout' => 5,
    ]);
    Http::fake(['*' => Http::response(['status' => true, 'message' => 'accepted'], 200)]);

    $customer = makeFollowUpCustomer();
    $delivery = CustomerFollowUpDelivery::query()->create([
        'workspace_id' => $customer->workspace_id,
        'customer_id' => $customer->id,
        'scheduled_for' => $customer->follow_up_at,
        'status' => 'pending',
    ]);

    $job = new SendCustomerFollowUpWhatsApp($delivery->id);
    $job->handle(app(WhatsAppGateway::class));
    $job->handle(app(WhatsAppGateway::class));

    expect($delivery->fresh()->status)->toBe('accepted')
        ->and($delivery->fresh()->accepted_at)->not->toBeNull();

    Http::assertSentCount(1);
});
