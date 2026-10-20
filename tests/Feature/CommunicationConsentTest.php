<?php

use App\Models\Customer;
use App\Models\CustomerCaptureLink;
use App\Models\CustomerCommunicationConsent;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

function consentTestWorkspace(User $owner, string $name = 'Consent workspace'): Workspace
{
    $workspace = $owner->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    return $workspace;
}

test('customer communication preference changes create append-only consent records', function () {
    $owner = User::factory()->create();
    $workspace = consentTestWorkspace($owner);

    $this->actingAs($owner)
        ->post(route('customers.store'), [
            'workspace_id' => $workspace->id,
            'name' => 'Consent customer',
            'status' => 'active',
        ])
        ->assertRedirect(route('customers.index', ['workspace_id' => $workspace->id]));

    $customer = Customer::query()->firstOrFail();

    expect(CustomerCommunicationConsent::query()->firstOrFail()->status)->toBe('unknown');

    $this->actingAs($owner)
        ->put(route('customers.update', $customer), [
            'workspace_id' => $workspace->id,
            'name' => $customer->name,
            'status' => 'active',
            'follow_up_whatsapp_enabled' => true,
        ])
        ->assertRedirect(route('customers.index', ['workspace_id' => $workspace->id]));

    $this->actingAs($owner)
        ->put(route('customers.update', $customer), [
            'workspace_id' => $workspace->id,
            'name' => $customer->name,
            'status' => 'active',
            'follow_up_whatsapp_enabled' => false,
        ])
        ->assertRedirect(route('customers.index', ['workspace_id' => $workspace->id]));

    expect(CustomerCommunicationConsent::query()->where('customer_id', $customer->id)->pluck('status')->all())
        ->toBe(['unknown', 'opted_in', 'opted_out']);

    expect(CustomerCommunicationConsent::query()->where('customer_id', $customer->id)->where('channel', 'whatsapp')->latest('id')->firstOrFail()->source)
        ->toBe('dashboard');
});

test('public capture records data processing consent without implying WhatsApp opt-in', function () {
    $owner = User::factory()->create();
    $workspace = consentTestWorkspace($owner);
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'workspace_id' => $workspace->id,
        'name' => 'Store QR',
        'token' => str_repeat('b', 48),
        'source' => 'qr',
        'is_active' => true,
    ]);

    $this->post(route('capture.submit', $link->token), [
        'name' => 'Captured customer',
        'phone' => '628123456789',
        'email' => 'captured@example.com',
        'consent' => 'yes',
    ])->assertRedirect(route('capture.show', $link->token));

    $customer = Customer::query()->where('name', 'Captured customer')->firstOrFail();
    $consent = CustomerCommunicationConsent::query()
        ->where('customer_id', $customer->id)
        ->firstOrFail();

    expect($consent->channel)->toBe('data_processing')
        ->and($consent->status)->toBe('opted_in')
        ->and($consent->source)->toBe('customer_capture')
        ->and(CustomerCommunicationConsent::query()
            ->where('customer_id', $customer->id)
            ->where('channel', 'whatsapp')
            ->exists())->toBeFalse();
});

test('consent history is tenant scoped and accessible to workspace members', function () {
    $owner = User::factory()->create();
    $workspace = consentTestWorkspace($owner);
    $member = User::factory()->create();
    $workspace->members()->attach($member->id, ['role' => 'member']);
    CustomerCommunicationConsent::query()->create([
        'workspace_id' => $workspace->id,
        'channel' => 'whatsapp',
        'status' => 'opted_out',
        'source' => 'dashboard',
        'recorded_at' => now(),
    ]);

    $this->actingAs($member)
        ->get(route('communication-consents.index', ['workspace_id' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('communication-consents/index')
            ->where('workspace.id', $workspace->id)
            ->has('consents.data', 1)
            ->where('consents.data.0.status', 'opted_out'));

    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('communication-consents.index', ['workspace_id' => $workspace->id]))
        ->assertNotFound();
});
