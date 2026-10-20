<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\QueryException;

test('guests cannot access workspaces', function () {
    $this->get('/workspaces')->assertRedirect('/login');
});

test('verified users can create a workspace and become its owner', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/workspaces', [
            'name' => 'Kopi Nusantara',
            'description' => 'Customer retention workspace',
        ])
        ->assertRedirect('/workspaces');

    $workspace = Workspace::query()->where('name', 'Kopi Nusantara')->firstOrFail();

    expect($workspace->owner_id)->toBe($user->id)
        ->and($workspace->members()->whereKey($user->id)->first()?->pivot->role)
        ->toBe('owner');
});

test('workspace input is validated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from('/workspaces')
        ->post('/workspaces', [
            'name' => str_repeat('x', 121),
            'description' => str_repeat('x', 2001),
        ])
        ->assertSessionHasErrors(['name', 'description']);

    expect(Workspace::query()->count())->toBe(0);
});

test('users only see workspaces they belong to', function () {
    $firstUser = User::factory()->create();
    $secondUser = User::factory()->create();

    $firstWorkspace = Workspace::query()->create([
        'owner_id' => $firstUser->id,
        'name' => 'First business',
    ]);
    $firstWorkspace->members()->attach($firstUser->id, ['role' => 'owner']);

    $secondWorkspace = Workspace::query()->create([
        'owner_id' => $secondUser->id,
        'name' => 'Private business',
    ]);
    $secondWorkspace->members()->attach($secondUser->id, ['role' => 'owner']);

    $this->actingAs($firstUser)
        ->get('/workspaces')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/index')
            ->has('workspaces', 1)
            ->where('workspaces.0.name', 'First business')
        );
});

test('workspace membership is unique per user', function () {
    $user = User::factory()->create();

    $workspace = Workspace::query()->create([
        'owner_id' => $user->id,
        'name' => 'Unique membership',
    ]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    expect(fn () => $workspace->members()->attach($user->id, ['role' => 'owner']))
        ->toThrow(QueryException::class);
});

test('workspace owners can update business settings', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Old business name',
        'description' => 'Old description',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner)
        ->put(route('workspaces.update', $workspace), [
            'name' => 'Updated business name',
            'description' => 'Updated description',
        ])
        ->assertRedirect('/workspaces');

    expect($workspace->fresh()->name)->toBe('Updated business name')
        ->and($workspace->fresh()->description)->toBe('Updated description');
});

test('non-owners cannot update business settings', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Protected business',
        'description' => 'Original description',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member)
        ->put(route('workspaces.update', $workspace), [
            'name' => 'Unauthorized change',
            'description' => 'Should not be saved',
        ])
        ->assertForbidden();

    expect($workspace->fresh()->name)->toBe('Protected business')
        ->and($workspace->fresh()->description)->toBe('Original description');
});

test('workspace settings input is validated', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Valid business',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner)
        ->from('/workspaces')
        ->put(route('workspaces.update', $workspace), [
            'name' => str_repeat('x', 121),
            'description' => str_repeat('x', 2001),
        ])
        ->assertSessionHasErrors(['name', 'description']);

    expect($workspace->fresh()->name)->toBe('Valid business');
});

test('workspace owners can update a non-owner member role', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Role management workspace',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($owner)
        ->put(route('workspaces.members.update', [$workspace, $member->id]), [
            'role' => 'admin',
        ])
        ->assertRedirect('/workspaces');

    expect($workspace->members()->whereKey($member->id)->first()?->pivot->role)
        ->toBe('admin');
});

test('non-owners cannot change workspace member roles', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Protected roles workspace',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member)
        ->put(route('workspaces.members.update', [$workspace, $owner->id]), [
            'role' => 'admin',
        ])
        ->assertForbidden();

    expect($workspace->members()->whereKey($owner->id)->first()?->pivot->role)
        ->toBe('owner');
});

test('workspace owners cannot change or remove their own owner membership', function () {
    $owner = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Owner protection workspace',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    $this->actingAs($owner)
        ->put(route('workspaces.members.update', [$workspace, $owner->id]), [
            'role' => 'member',
        ])
        ->assertUnprocessable();

    $this->delete(route('workspaces.members.destroy', [$workspace, $owner->id]))
        ->assertUnprocessable();

    expect($workspace->members()->whereKey($owner->id)->exists())->toBeTrue();
});

test('workspace owners can remove a non-owner member', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::query()->create([
        'owner_id' => $owner->id,
        'name' => 'Member removal workspace',
    ]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($owner)
        ->delete(route('workspaces.members.destroy', [$workspace, $member->id]))
        ->assertRedirect('/workspaces');

    expect($workspace->members()->whereKey($member->id)->exists())->toBeFalse();
});
