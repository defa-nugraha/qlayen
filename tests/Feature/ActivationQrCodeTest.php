<?php

use App\Models\ActivationQrCode;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

function createActivationQrFor(User $admin): ActivationQrCode
{
    $workspace = Workspace::query()->create(['owner_id' => $admin->id, 'name' => 'Admin workspace']);
    $workspace->members()->attach($admin->id, ['role' => 'owner']);

    return ActivationQrCode::query()->create([
        'generated_by_user_id' => $admin->id,
        'generated_workspace_id' => $workspace->id,
        'name' => 'Starter QR',
        'token' => Str::random(48),
        'status' => 'pending',
    ]);
}

it('allows a workspace owner to generate a pending activation QR', function () {
    $admin = User::factory()->create();
    $workspace = Workspace::query()->create(['owner_id' => $admin->id, 'name' => 'Admin workspace']);
    $workspace->members()->attach($admin->id, ['role' => 'owner']);

    $this->actingAs($admin)->post(route('activation-qr.store'), [
        'workspace_id' => $workspace->id,
        'name' => 'New business QR',
        'foreground_color' => '#111827',
        'background_color' => '#FFFFFF',
        'frame_text' => 'SCAN TO ACTIVATE',
    ])->assertRedirect(route('activation-qr.index', ['workspace_id' => $workspace->id]));

    expect(ActivationQrCode::query()->where('name', 'New business QR')->first())
        ->not->toBeNull()
        ->status->toBe('pending');
});

it('activates a QR once and creates a business workspace for the new owner', function () {
    Event::fake([Registered::class]);
    $admin = User::factory()->create();
    $code = createActivationQrFor($admin);

    $this->post(route('activation-qr.activate', $code->token), [
        'owner_name' => 'Business Owner',
        'business_name' => 'Nusantara Coffee',
        'email' => 'owner@example.com',
        'password' => 'correct-horse-battery-12',
        'password_confirmation' => 'correct-horse-battery-12',
    ])->assertRedirect(route('verification.notice'));

    $code->refresh();

    expect($code->status)->toBe('active')
        ->and($code->workspace_id)->not->toBeNull()
        ->and($code->activated_by_user_id)->not->toBeNull()
        ->and($code->workspace->name)->toBe('Nusantara Coffee')
        ->and($code->workspace->owner_id)->toBe($code->activated_by_user_id);

    $this->assertAuthenticatedAs(User::query()->findOrFail($code->activated_by_user_id));
});

it('rejects a second activation attempt for the same QR', function () {
    Event::fake([Registered::class]);
    $admin = User::factory()->create();
    $code = createActivationQrFor($admin);
    $payload = [
        'owner_name' => 'Business Owner',
        'business_name' => 'Nusantara Coffee',
        'email' => 'owner@example.com',
        'password' => 'correct-horse-battery-12',
        'password_confirmation' => 'correct-horse-battery-12',
    ];

    $this->post(route('activation-qr.activate', $code->token), $payload)->assertRedirect(route('verification.notice'));
    auth()->logout();

    $this->post(route('activation-qr.activate', $code->token), [
        ...$payload,
        'email' => 'second-owner@example.com',
    ])->assertStatus(409);

    expect(User::query()->whereIn('email', ['owner@example.com', 'second-owner@example.com'])->count())->toBe(1);
});

it('rejects QR generation for a workspace member role', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::query()->create(['owner_id' => $owner->id, 'name' => 'Shared workspace']);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member)->post(route('activation-qr.store'), [
        'workspace_id' => $workspace->id,
        'name' => 'Not allowed',
        'foreground_color' => '#111827',
        'background_color' => '#FFFFFF',
        'frame_text' => 'SCAN TO ACTIVATE',
    ])->assertForbidden();
});
