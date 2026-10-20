<?php

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

function auditTestWorkspace(User $owner, string $name = 'Audit workspace'): Workspace
{
    $workspace = $owner->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);

    return $workspace;
}

test('customer changes create an audit event without storing customer contact details', function () {
    $owner = User::factory()->create();
    $workspace = auditTestWorkspace($owner);

    $this->actingAs($owner)
        ->post(route('customers.store'), [
            'workspace_id' => $workspace->id,
            'name' => 'Private Customer Name',
            'phone' => '628123456789',
            'email' => 'private@example.com',
            'source' => 'QR',
            'status' => 'active',
        ])
        ->assertRedirect(route('customers.index', ['workspace_id' => $workspace->id]));

    $log = AuditLog::query()->where('event', 'customer.created')->firstOrFail();

    expect($log->workspace_id)->toBe($workspace->id)
        ->and($log->actor_user_id)->toBe($owner->id)
        ->and($log->subject_type)->toBe('customer')
        ->and($log->metadata)->toBe(['source' => 'QR']);

    expect(json_encode($log->metadata))
        ->not->toContain('private@example.com')
        ->not->toContain('628123456789')
        ->not->toContain('Private Customer Name');
});

test('workspace owners and admins can view audit events for their workspace', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $workspace = auditTestWorkspace($owner);
    $workspace->members()->attach($admin->id, ['role' => 'admin']);

    AuditLog::query()->create([
        'workspace_id' => $workspace->id,
        'actor_user_id' => $owner->id,
        'event' => 'workspace.settings_updated',
        'subject_type' => 'workspace',
        'subject_id' => $workspace->id,
        'metadata' => ['field' => 'description'],
    ]);

    $this->actingAs($admin)
        ->get(route('audit-logs.index', ['workspace_id' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit-logs/index')
            ->where('workspace.id', $workspace->id)
            ->has('logs.data', 1)
            ->where('logs.data.0.event', 'workspace.settings_updated'));
});

test('workspace members cannot view audit events and other tenants remain isolated', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = auditTestWorkspace($owner);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    AuditLog::query()->create([
        'workspace_id' => $workspace->id,
        'actor_user_id' => $owner->id,
        'event' => 'workspace.created',
        'subject_type' => 'workspace',
        'subject_id' => $workspace->id,
    ]);

    $this->actingAs($member)
        ->get(route('audit-logs.index', ['workspace_id' => $workspace->id]))
        ->assertForbidden();

    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->get(route('audit-logs.index', ['workspace_id' => $workspace->id]))
        ->assertNotFound();
});
