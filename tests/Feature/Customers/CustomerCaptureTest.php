<?php

use App\Models\Customer;
use App\Models\CustomerCaptureLink;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

function captureTestWorkspace(User $user, string $name = 'Capture test workspace'): Workspace
{
    $workspace = $user->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    return $workspace;
}

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
    $workspace = captureTestWorkspace($owner);
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'workspace_id' => $workspace->id,
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
        ->and($customer->workspace_id)->toBe($workspace->id)
        ->and($customer->consent_at)->not->toBeNull();
});

test('disabled capture links cannot display the form or accept submissions', function () {
    $owner = User::factory()->create();
    $workspace = captureTestWorkspace($owner, 'Expired workspace');
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'workspace_id' => $workspace->id,
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
    $workspace = captureTestWorkspace($owner, 'Private workspace');
    $link = CustomerCaptureLink::query()->create([
        'user_id' => $owner->id,
        'workspace_id' => $workspace->id,
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

test('capture links and their mutations are isolated by workspace', function () {
    $user = User::factory()->create();
    $firstWorkspace = captureTestWorkspace($user, 'First capture workspace');
    $secondWorkspace = captureTestWorkspace($user, 'Second capture workspace');

    $link = CustomerCaptureLink::query()->create([
        'user_id' => $user->id,
        'workspace_id' => $secondWorkspace->id,
        'name' => 'Second workspace campaign',
        'token' => str_repeat('d', 48),
        'source' => 'qr',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('capture.index', ['workspace_id' => $firstWorkspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('links', 0));

    $this->patch(route('capture.toggle', $link), [
        'workspace_id' => $firstWorkspace->id,
    ])->assertNotFound();

    expect($link->fresh()->is_active)->toBeTrue();
});
