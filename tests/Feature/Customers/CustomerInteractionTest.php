<?php

use App\Models\Customer;
use App\Models\CustomerInteraction;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

function interactionTestWorkspace(User $user, string $name = 'Interaction workspace'): Workspace
{
    $workspace = $user->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    return $workspace;
}

function interactionTestCustomer(User $user, Workspace $workspace, string $name = 'Interaction customer'): Customer
{
    return Customer::query()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'name' => $name,
        'status' => 'active',
    ]);
}

test('guests cannot access customer interaction history', function () {
    $this->get('/customers/1/interactions')->assertRedirect(route('login'));
});

test('a workspace member can record and view customer interactions', function () {
    $user = User::factory()->create();
    $workspace = interactionTestWorkspace($user);
    $customer = interactionTestCustomer($user, $workspace);

    $this->actingAs($user)
        ->post(route('customers.interactions.store', $customer), [
            'workspace_id' => $workspace->id,
            'type' => 'call',
            'summary' => 'Discussed product options',
            'details' => 'Customer requested a follow-up next week.',
            'occurred_at' => '2026-10-20 10:30:00',
        ])
        ->assertRedirect(route('customers.interactions.index', [
            'customer' => $customer->id,
            'workspace_id' => $workspace->id,
        ]));

    $interaction = CustomerInteraction::query()->firstOrFail();

    expect($interaction->customer_id)->toBe($customer->id)
        ->and($interaction->user_id)->toBe($user->id)
        ->and($interaction->type)->toBe('call')
        ->and($interaction->summary)->toBe('Discussed product options');

    $this->get(route('customers.interactions.index', [
        'customer' => $customer->id,
        'workspace_id' => $workspace->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/interactions/index')
            ->where('customer.id', $customer->id)
            ->where('customer.name', $customer->name)
            ->has('interactions.data', 1)
            ->where('interactions.data.0.summary', 'Discussed product options')
            ->where('interactions.data.0.user.name', $user->name));
});

test('interaction input is validated', function () {
    $user = User::factory()->create();
    $workspace = interactionTestWorkspace($user);
    $customer = interactionTestCustomer($user, $workspace);

    $this->actingAs($user)
        ->post(route('customers.interactions.store', $customer), [
            'workspace_id' => $workspace->id,
            'type' => 'unknown',
            'summary' => '',
            'occurred_at' => 'not-a-date',
        ])
        ->assertSessionHasErrors(['type', 'summary', 'occurred_at']);

    expect(CustomerInteraction::query()->count())->toBe(0);
});

test('a user cannot access interactions for a customer outside the selected workspace', function () {
    $user = User::factory()->create();
    $firstWorkspace = interactionTestWorkspace($user, 'First interaction workspace');
    $secondWorkspace = interactionTestWorkspace($user, 'Second interaction workspace');
    $customer = interactionTestCustomer($user, $secondWorkspace, 'Private customer');

    $this->actingAs($user)
        ->get(route('customers.interactions.index', [
            'customer' => $customer->id,
            'workspace_id' => $firstWorkspace->id,
        ]))
        ->assertNotFound();

    $this->actingAs($user)
        ->post(route('customers.interactions.store', $customer), [
            'workspace_id' => $firstWorkspace->id,
            'type' => 'note',
            'summary' => 'Should not be saved',
            'occurred_at' => '2026-10-20 10:30:00',
        ])
        ->assertNotFound();

    expect(CustomerInteraction::query()->count())->toBe(0);
});

test('a user cannot select a workspace they do not belong to for interaction history', function () {
    $owner = User::factory()->create();
    $workspace = interactionTestWorkspace($owner, 'Private interaction workspace');
    $customer = interactionTestCustomer($owner, $workspace);
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('customers.interactions.index', [
            'customer' => $customer->id,
            'workspace_id' => $workspace->id,
        ]))
        ->assertNotFound();
});
