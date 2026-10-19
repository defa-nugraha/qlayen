<?php

use App\Models\User;
use App\Models\Workspace;

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
        ->toThrow(\Illuminate\Database\QueryException::class);
});
