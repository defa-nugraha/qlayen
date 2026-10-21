<?php

use App\Models\User;
use App\Models\Workspace;

function roleMiddlewareTestWorkspace(User $owner, User $member, string $role): Workspace
{
    $workspace = $owner->ownedWorkspaces()->create([
        'name' => 'Role middleware test workspace',
    ]);

    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => $role]);

    return $workspace;
}

it('forbids workspace members from creating customers', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create([
        'role' => User::ROLE_MEMBER,
    ]);
    $workspace = roleMiddlewareTestWorkspace($owner, $member, 'member');

    $this->actingAs($member)
        ->post(route('customers.store'), [
            'workspace_id' => $workspace->id,
            'name' => 'Test customer',
            'status' => 'active',
        ])
        ->assertForbidden();
});

it('allows workspace administrators to create customers', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create([
        'role' => User::ROLE_MEMBER,
    ]);
    $workspace = roleMiddlewareTestWorkspace($owner, $admin, 'admin');

    $this->actingAs($admin)
        ->post(route('customers.store'), [
            'workspace_id' => $workspace->id,
            'name' => 'Admin customer',
            'status' => 'active',
        ])
        ->assertRedirect(route('customers.index', ['workspace_id' => $workspace->id]));

    $this->assertDatabaseHas('customers', [
        'workspace_id' => $workspace->id,
        'name' => 'Admin customer',
    ]);
});

it('defaults new users to the member role', function () {
    $user = User::factory()->create();

    expect($user->fresh()->role)->toBe(User::ROLE_MEMBER);
});
