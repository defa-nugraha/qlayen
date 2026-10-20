<?php

use App\\Models\\Customer;
use App\\Models\\User;
use App\\Models\\Workspace;
use Inertia\\Testing\\AssertableInertia as Assert;
use Illuminate\\Support\\Carbon;

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
