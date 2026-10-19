<?php

use App\Models\Customer;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access customer records', function () {
    $this->get(route('customers.index'))->assertRedirect(route('login'));
});

test('a verified user can create and view their customer', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('customers.store'), [
        'name' => 'Alya Putri',
        'phone' => '628123456789',
        'email' => 'alya@example.com',
        'source' => 'QR',
        'notes' => 'Asked about a product.',
        'follow_up_at' => '2026-10-25 10:00:00',
        'follow_up_notes' => 'Send product information.',
        'status' => 'active',
    ])->assertRedirect(route('customers.index'));

    $customer = Customer::query()->firstOrFail();

    expect($customer->user_id)->toBe($user->id)
        ->and($customer->name)->toBe('Alya Putri')
        ->and($customer->source)->toBe('QR')
        ->and($customer->follow_up_notes)->toBe('Send product information.');

    $this->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Alya Putri'));
});

test('customer input is validated', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('customers.store'), [
            'name' => '',
            'email' => 'not-an-email',
            'status' => 'unknown',
        ])
        ->assertSessionHasErrors(['name', 'email', 'status']);
});

test('a user cannot view another users customer in search results', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    Customer::query()->create([
        'user_id' => $owner->id,
        'name' => 'Private Customer',
        'status' => 'active',
    ]);

    $this->actingAs($intruder)
        ->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->has('customers.data', 0));
});

test('a user cannot update or delete another users customer', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $owner->id,
        'name' => 'Private Customer',
        'status' => 'active',
    ]);

    $this->actingAs($intruder)
        ->put(route('customers.update', $customer), [
            'name' => 'Hijacked',
            'status' => 'active',
        ])
        ->assertNotFound();

    $this->actingAs($intruder)
        ->delete(route('customers.destroy', $customer))
        ->assertNotFound();

    expect($customer->fresh()->name)->toBe('Private Customer');
});

test('a customer owner can update and delete their record', function () {
    $user = User::factory()->create();
    $customer = Customer::query()->create([
        'user_id' => $user->id,
        'name' => 'Old Name',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->put(route('customers.update', $customer), [
            'name' => 'New Name',
            'phone' => '628987654321',
            'status' => 'inactive',
        ])
        ->assertRedirect(route('customers.index'));

    expect($customer->fresh()->name)->toBe('New Name')
        ->and($customer->fresh()->status)->toBe('inactive');

    $this->delete(route('customers.destroy', $customer))
        ->assertRedirect(route('customers.index'));

    expect(Customer::query()->count())->toBe(0);
});

test('customer search is limited to the current user and matching fields', function () {
    $user = User::factory()->create();
    Customer::query()->create(['user_id' => $user->id, 'name' => 'Alya Putri', 'status' => 'active']);
    Customer::query()->create(['user_id' => $user->id, 'name' => 'Bima Saputra', 'phone' => '628111222333', 'status' => 'active']);
    Customer::query()->create(['user_id' => User::factory()->create()->id, 'name' => 'Alya Hidden', 'status' => 'active']);

    $this->actingAs($user)
        ->get(route('customers.index', ['search' => 'Alya']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Alya Putri'));
});
