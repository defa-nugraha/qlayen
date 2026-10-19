<?php

use App\Models\Customer;
use App\Models\CustomerCaptureLink;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot manage capture links', function () {
    $this->get(route('capture.index'))->assertRedirect(route('login'));
});

test('a verified user can create a QR or NFC capture link', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('capture.store'), [
            'name' => 'Store Counter',
            'source' => 'qr',
        ])
        ->assertRedirect(route('capture.index'));

    $link = CustomerCaptureLink::query()->firstOrFail();

    expect($link->user_id)->toBe($user->id)
        ->and($link->source)->toBe('qr')
        ->and(strlen($link->token))->toBe(48);

    $this->get(route('capture.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('capture/index')
            ->has('links', 1)
            ->where('links.0.name', 'Store Counter'));
});

test('public capture form creates a customer only after consent', function () {
    $owner = User::factory()->create();
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'name' => 'Front Desk',
        'token' => str_repeat('a', 48),
        'source' => 'nfc',
        'is_active' => true,
    ]);

    $this->get(route('capture.show', $link->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('capture/show')
            ->where('campaignName', 'Front Desk'));

    $this->from(route('capture.show', $link->token))
        ->post(route('capture.submit', $link->token), [
            'name' => 'Dina Putri',
            'phone' => '628123456789',
            'email' => 'dina@example.com',
            'consent' => false,
        ])
        ->assertSessionHasErrors('consent');

    expect(Customer::query()->count())->toBe(0);

    $this->post(route('capture.submit', $link->token), [
        'name' => 'Dina Putri',
        'phone' => '628123456789',
        'email' => 'dina@example.com',
        'consent' => true,
    ])->assertRedirect(route('capture.show', $link->token));

    $customer = Customer::query()->firstOrFail();

    expect($customer->user_id)->toBe($owner->id)
        ->and($customer->name)->toBe('Dina Putri')
        ->and($customer->source)->toBe('NFC')
        ->and($customer->consent_at)->not->toBeNull();
});

test('disabled capture links cannot display the form or accept submissions', function () {
    $owner = User::factory()->create();
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'name' => 'Expired Campaign',
        'token' => str_repeat('b', 48),
        'source' => 'qr',
        'is_active' => false,
    ]);

    $this->get(route('capture.show', $link->token))->assertNotFound();

    $this->post(route('capture.submit', $link->token), [
        'name' => 'A customer',
        'phone' => '628123456789',
        'consent' => true,
    ])->assertNotFound();

    expect(Customer::query()->count())->toBe(0);
});

test('users cannot disable another users capture link', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'name' => 'Private Campaign',
        'token' => str_repeat('c', 48),
        'source' => 'qr',
        'is_active' => true,
    ]);

    $this->actingAs($otherUser)
        ->patch(route('capture.toggle', $link))
        ->assertNotFound();

    expect($link->fresh()->is_active)->toBeTrue();
});
