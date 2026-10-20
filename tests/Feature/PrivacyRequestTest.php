<?php

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\PrivacyRequest;
use App\Models\User;
use App\Models\Workspace;

function privacyTestWorkspace(User $owner, string $name = 'Privacy workspace'): Workspace
{
    $workspace = $owner->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    return $workspace;
}

test('workspace members can create privacy requests for customers in their workspace', function () {
    $owner = User::factory()->create();
    $workspace = privacyTestWorkspace($owner);
    $customer = Customer::query()->create([
        'user_id' => $owner->id,
        'workspace_id' => $workspace->id,
        'name' => 'Privacy customer',
        'status' => 'active',
    ]);

    $this->actingAs($owner)
        ->post(route('privacy-requests.store'), [
            'workspace_id' => $workspace->id,
            'customer_id' => $customer->id,
            'request_type' => 'deletion',
            'details' => 'Customer requested deletion review.',
        ])
        ->assertRedirect(route('privacy-requests.index', ['workspace_id' => $workspace->id]));

    $request = PrivacyRequest::query()->firstOrFail();

    expect($request->workspace_id)->toBe($workspace->id)
        ->and($request->customer_id)->toBe($customer->id)
        ->and($request->request_type)->toBe('deletion')
        ->and($request->status)->toBe('pending')
        ->and($request->requested_by_user_id)->toBe($owner->id);

    expect(AuditLog::query()->where('event', 'privacy_request.created')->exists())->toBeTrue();
});

test('privacy requests reject cross-workspace customer references', function () {
    $owner = User::factory()->create();
    $workspace = privacyTestWorkspace($owner);
    $otherOwner = User::factory()->create();
    $otherWorkspace = privacyTestWorkspace($otherOwner, 'Other privacy workspace');
    $customer = Customer::query()->create([
        'user_id' => $otherOwner->id,
        'workspace_id' => $otherWorkspace->id,
        'name' => 'Other tenant customer',
        'status' => 'active',
    ]);

    $this->actingAs($owner)
        ->from(route('privacy-requests.index', ['workspace_id' => $workspace->id]))
        ->post(route('privacy-requests.store'), [
            'workspace_id' => $workspace->id,
            'customer_id' => $customer->id,
            'request_type' => 'access',
        ])
        ->assertSessionHasErrors('customer_id');

    expect(PrivacyRequest::query()->count())->toBe(0);
});

test('only workspace owners and admins can resolve privacy requests', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $workspace = privacyTestWorkspace($owner);
    $workspace->members()->attach($admin->id, ['role' => 'admin']);
    $workspace->members()->attach($member->id, ['role' => 'member']);
    $privacyRequest = PrivacyRequest::query()->create([
        'workspace_id' => $workspace->id,
        'requested_by_user_id' => $member->id,
        'request_type' => 'access',
        'status' => 'pending',
    ]);

    $this->actingAs($member)
        ->patch(route('privacy-requests.update', $privacyRequest), [
            'workspace_id' => $workspace->id,
            'status' => 'completed',
        ])
        ->assertForbidden();

    $this->actingAs($admin)
        ->patch(route('privacy-requests.update', $privacyRequest), [
            'workspace_id' => $workspace->id,
            'status' => 'rejected',
            'resolution_note' => 'Request could not be verified.',
        ])
        ->assertRedirect(route('privacy-requests.index', ['workspace_id' => $workspace->id]));

    expect($privacyRequest->fresh()->status)->toBe('rejected')
        ->and($privacyRequest->fresh()->resolved_by_user_id)->toBe($admin->id)
        ->and($privacyRequest->fresh()->resolved_at)->not->toBeNull();
});

test('a rejection requires a reason and privacy requests are tenant isolated', function () {
    $owner = User::factory()->create();
    $workspace = privacyTestWorkspace($owner);
    $privacyRequest = PrivacyRequest::query()->create([
        'workspace_id' => $workspace->id,
        'requested_by_user_id' => $owner->id,
        'request_type' => 'correction',
        'status' => 'pending',
    ]);

    $this->actingAs($owner)
        ->from(route('privacy-requests.index', ['workspace_id' => $workspace->id]))
        ->patch(route('privacy-requests.update', $privacyRequest), [
            'workspace_id' => $workspace->id,
            'status' => 'rejected',
        ])
        ->assertSessionHasErrors('resolution_note');

    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('privacy-requests.index', ['workspace_id' => $workspace->id]))
        ->assertNotFound();
});

test('privacy request input is validated', function () {
    $owner = User::factory()->create();
    $workspace = privacyTestWorkspace($owner);

    $this->actingAs($owner)
        ->post(route('privacy-requests.store'), [
            'workspace_id' => $workspace->id,
            'request_type' => 'unknown',
            'details' => str_repeat('x', 2001),
        ])
        ->assertSessionHasErrors(['request_type', 'details']);

    expect(PrivacyRequest::query()->count())->toBe(0);
});
