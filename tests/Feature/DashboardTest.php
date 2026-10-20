<?php

use App\Models\Customer;
use App\Models\CustomerInteraction;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

function dashboardTestWorkspace(User $user, string $name): Workspace
{
    $workspace = $user->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    return $workspace;
}

test('guests cannot access the operational dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('dashboard metrics and recent activity are scoped to the selected workspace', function () {
    $user = User::factory()->create();
    $workspace = dashboardTestWorkspace($user, 'Dashboard workspace');
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'workspace_id' => $workspace->id,
        'name' => 'Dashboard customer',
        'status' => 'active',
        'follow_up_at' => now()->startOfDay(),
        'follow_up_notes' => 'Call to confirm details',
    ]);

    CustomerInteraction::query()->create([
        'customer_id' => $customer->id,
        'user_id' => $user->id,
        'type' => 'call',
        'summary' => 'Discussed next steps',
        'occurred_at' => now()->subDays(2),
    ]);

    $workspace->customerCaptureLinks()->create([
        'user_id' => $user->id,
        'name' => 'Store QR',
        'token' => str_repeat('a', 40),
        'source' => 'qr',
        'is_active' => true,
    ]);

    $otherUser = User::factory()->create();
    $otherWorkspace = dashboardTestWorkspace($otherUser, 'Other workspace');
    $otherCustomer = Customer::query()->create([
        'user_id' => $otherUser->id,
        'workspace_id' => $otherWorkspace->id,
        'name' => 'Private customer',
        'status' => 'active',
    ]);
    CustomerInteraction::query()->create([
        'customer_id' => $otherCustomer->id,
        'user_id' => $otherUser->id,
        'type' => 'note',
        'summary' => 'Private interaction',
        'occurred_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['workspace_id' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('workspace.id', $workspace->id)
            ->where('metrics.customers_total', 1)
            ->where('metrics.customers_active', 1)
            ->where('metrics.interactions_last_30_days', 1)
            ->where('metrics.capture_links_active', 1)
            ->where('metrics.follow_ups_today', 1)
            ->where('recentInteractions.0.summary', 'Discussed next steps')
            ->where('dueFollowUps.0.name', 'Dashboard customer')
            ->where('definitions.capture_links', 'Active QR/NFC capture links; this is not a scan count.')
            ->missing('recentInteractions.1'));
});

test('dashboard does not allow access to a workspace outside the user memberships', function () {
    $owner = User::factory()->create();
    $workspace = dashboardTestWorkspace($owner, 'Private dashboard');
    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('dashboard', ['workspace_id' => $workspace->id]))
        ->assertNotFound();
});
