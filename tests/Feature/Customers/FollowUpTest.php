<?php

use App\Jobs\SendCustomerFollowUpWhatsApp;
use App\Models\Customer;
use App\Models\CustomerFollowUpDelivery;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

function followUpTestWorkspace(User $user, string $name = 'Follow-up workspace'): Workspace
{
    $workspace = $user->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    return $workspace;
}

function followUpTestCustomer(User $user, Workspace $workspace, string $name, ?string $followUpAt, string $status = 'active'): Customer
{
    return Customer::query()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'name' => $name,
        'status' => $status,
        'follow_up_at' => $followUpAt,
        'follow_up_notes' => 'Contact about renewal',
    ]);
}

beforeEach(function () {
    Carbon::setTestNow('2026-10-20 12:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

test('guests cannot access follow-up workflow', function () {
    $this->get(route('follow-ups.index'))->assertRedirect(route('login'));
});

test('follow-up workflow separates overdue today and upcoming customers', function () {
    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);

    followUpTestCustomer($user, $workspace, 'Yesterday customer', '2026-10-19 10:00:00');
    followUpTestCustomer($user, $workspace, 'Today customer', '2026-10-20 18:00:00');
    followUpTestCustomer($user, $workspace, 'Tomorrow customer', '2026-10-21 09:00:00');
    followUpTestCustomer($user, $workspace, 'No date customer', null);

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'overdue']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('follow-ups/index')
            ->where('counts.overdue', 1)
            ->where('counts.today', 1)
            ->where('counts.upcoming', 1)
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Yesterday customer'));

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'today']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Today customer'));

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'upcoming']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Tomorrow customer'));

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'all']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('customers.data', 3));
});

test('follow-up workflow is scoped to selected workspace and active customers', function () {
    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user, 'Visible workspace');
    $otherWorkspace = followUpTestWorkspace($user, 'Other workspace');
    followUpTestCustomer($user, $workspace, 'Visible customer', '2026-10-21 09:00:00');
    followUpTestCustomer($user, $workspace, 'Inactive customer', '2026-10-21 09:00:00', 'inactive');
    followUpTestCustomer($user, $otherWorkspace, 'Other workspace customer', '2026-10-21 09:00:00');

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'all']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Visible customer'));
});

test('follow-up search matches customer contact and follow-up notes', function () {
    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);
    followUpTestCustomer($user, $workspace, 'Renewal customer', '2026-10-21 09:00:00');

    $this->actingAs($user)
        ->get(route('follow-ups.index', [
            'workspace_id' => $workspace->id,
            'filter' => 'all',
            'search' => 'renewal',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'renewal')
            ->has('customers.data', 1));
});

test('invalid follow-up filter is rejected', function () {
    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'random']))
        ->assertStatus(422);
});

test('users cannot view follow-ups for a workspace they do not belong to', function () {
    $owner = User::factory()->create();
    $workspace = followUpTestWorkspace($owner);
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id]))
        ->assertNotFound();
});

test('users can complete a follow-up in their selected workspace', function () {
    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);
    $customer = followUpTestCustomer($user, $workspace, 'Completed customer', '2026-10-20 10:00:00');

    $this->actingAs($user)
        ->patch(route('follow-ups.complete', [
            'customer' => $customer->id,
            'workspace_id' => $workspace->id,
            'filter' => 'all',
        ]))
        ->assertRedirect(route('follow-ups.index', [
            'workspace_id' => $workspace->id,
            'filter' => 'all',
        ]));

    expect($customer->fresh()->follow_up_completed_at)->not->toBeNull();

    $this->actingAs($user)
        ->get(route('follow-ups.index', ['workspace_id' => $workspace->id, 'filter' => 'all']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('customers.data', 0));
});

test('users cannot complete a follow-up in another workspace', function () {
    $owner = User::factory()->create();
    $workspace = followUpTestWorkspace($owner);
    $customer = followUpTestCustomer($owner, $workspace, 'Private customer', '2026-10-21 09:00:00');
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->patch(route('follow-ups.complete', [
            'customer' => $customer->id,
            'workspace_id' => $workspace->id,
        ]))
        ->assertNotFound();

    expect($customer->fresh()->follow_up_completed_at)->toBeNull();
});

test('rescheduling an existing follow-up makes it pending again', function () {
    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);
    $customer = followUpTestCustomer($user, $workspace, 'Rescheduled customer', '2026-10-20 10:00:00');
    $customer->update(['follow_up_completed_at' => Carbon::parse('2026-10-20 12:00:00')]);

    $this->actingAs($user)
        ->put(route('customers.update', $customer), [
            'workspace_id' => $workspace->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'source' => $customer->source,
            'notes' => $customer->notes,
            'follow_up_at' => '2026-10-22 10:00:00',
            'follow_up_notes' => $customer->follow_up_notes,
            'status' => $customer->status,
        ])
        ->assertRedirect();

    expect($customer->fresh()->follow_up_completed_at)->toBeNull();
});

test('users can retry a failed WhatsApp delivery in their workspace once', function () {
    Queue::fake();

    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);
    $customer = followUpTestCustomer($user, $workspace, 'Retry customer', '2026-10-20 10:00:00');
    $customer->update([
        'phone' => '628123456789',
        'follow_up_whatsapp_enabled' => true,
        'whatsapp_consent_at' => now()->subDay(),
    ]);

    $delivery = CustomerFollowUpDelivery::query()->create([
        'workspace_id' => $workspace->id,
        'customer_id' => $customer->id,
        'scheduled_for' => $customer->follow_up_at,
        'status' => 'failed',
        'attempts' => 3,
        'last_error' => 'Temporary gateway failure.',
    ]);

    $this->actingAs($user)
        ->post(route('follow-ups.deliveries.retry', [
            'delivery' => $delivery->id,
            'workspace_id' => $workspace->id,
            'filter' => 'all',
        ]))
        ->assertRedirect(route('follow-ups.index', [
            'workspace_id' => $workspace->id,
            'filter' => 'all',
        ]));

    expect($delivery->fresh()->status)->toBe('pending')
        ->and($delivery->fresh()->last_error)->toBeNull()
        ->and($delivery->fresh()->attempts)->toBe(3);

    Queue::assertPushed(SendCustomerFollowUpWhatsApp::class, 1);

    $this->actingAs($user)
        ->post(route('follow-ups.deliveries.retry', [
            'delivery' => $delivery->id,
            'workspace_id' => $workspace->id,
        ]))
        ->assertStatus(422);

    Queue::assertPushed(SendCustomerFollowUpWhatsApp::class, 1);
});

test('users cannot retry a delivery after WhatsApp consent is revoked', function () {
    Queue::fake();

    $user = User::factory()->create();
    $workspace = followUpTestWorkspace($user);
    $customer = followUpTestCustomer($user, $workspace, 'Opted out customer', '2026-10-20 10:00:00');
    $customer->update([
        'phone' => '628123456789',
        'follow_up_whatsapp_enabled' => true,
        'whatsapp_consent_at' => null,
    ]);
    $delivery = CustomerFollowUpDelivery::query()->create([
        'workspace_id' => $workspace->id,
        'customer_id' => $customer->id,
        'scheduled_for' => $customer->follow_up_at,
        'status' => 'failed',
        'attempts' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('follow-ups.deliveries.retry', [
            'delivery' => $delivery->id,
            'workspace_id' => $workspace->id,
        ]))
        ->assertStatus(422);

    expect($delivery->fresh()->status)->toBe('failed');
    Queue::assertNothingPushed();
});

test('users cannot retry a delivery belonging to another workspace', function () {
    Queue::fake();

    $owner = User::factory()->create();
    $workspace = followUpTestWorkspace($owner);
    $customer = followUpTestCustomer($owner, $workspace, 'Private retry customer', '2026-10-20 10:00:00');
    $delivery = CustomerFollowUpDelivery::query()->create([
        'workspace_id' => $workspace->id,
        'customer_id' => $customer->id,
        'scheduled_for' => $customer->follow_up_at,
        'status' => 'failed',
    ]);
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->post(route('follow-ups.deliveries.retry', [
            'delivery' => $delivery->id,
            'workspace_id' => $workspace->id,
        ]))
        ->assertNotFound();

    expect($delivery->fresh()->status)->toBe('failed');
    Queue::assertNothingPushed();
});
