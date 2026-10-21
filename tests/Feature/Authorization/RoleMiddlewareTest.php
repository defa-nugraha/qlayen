<?php

use App\Models\User;

it('forbids members from creating customers', function () {
    $member = User::factory()->create([
        'role' => User::ROLE_MEMBER,
    ]);

    $this->actingAs($member)
        ->post(route('customers.store'), [])
        ->assertForbidden();
});

it('allows administrators past the role middleware for customer creation', function () {
    $admin = User::factory()->create([
        'role' => User::ROLE_ADMIN,
    ]);

    $this->actingAs($admin)
        ->post(route('customers.store'), [])
        ->assertSessionHasErrors(['name', 'status']);
});

it('defaults new users to the member role', function () {
    $user = User::factory()->create();

    expect($user->fresh()->role)->toBe(User::ROLE_MEMBER);
});
