<?php

use App\Models\CustomerCaptureLink;
use App\Models\User;
use App\Models\Workspace;
use Inertia\Testing\AssertableInertia as Assert;

function createAnalyticsCaptureLink(User $user, string $name = 'Analytics workspace'): CustomerCaptureLink
{
    $workspace = $user->ownedWorkspaces()->create(['name' => $name]);
    $workspace->members()->attach($user->id, ['role' => 'owner']);

    return $workspace->customerCaptureLinks()->create([
        'user_id' => $user->id,
        'name' => 'Campaign',
        'source' => 'qr',
        'token' => str()->random(48),
        'is_active' => true,
    ]);
}

test('public capture form visits increment the campaign visit counter', function () {
    $user = User::factory()->create();
    $link = createAnalyticsCaptureLink($user);

    $this->get(route('capture.show', $link->token))->assertOk();
    $this->get(route('capture.show', $link->token))->assertOk();

    expect($link->fresh()->visits_count)->toBe(2);
});

test('disabled capture links do not record visits', function () {
    $user = User::factory()->create();
    $link = createAnalyticsCaptureLink($user);
    $link->update(['is_active' => false]);

    $this->get(route('capture.show', $link->token))->assertNotFound();

    expect($link->fresh()->visits_count)->toBe(0);
});

test('capture link list exposes visit totals for the selected workspace', function () {
    $user = User::factory()->create();
    $link = createAnalyticsCaptureLink($user);
    $link->increment('visits_count', 7);

    $this->actingAs($user)
        ->get(route('capture.index', ['workspace_id' => $link->workspace_id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('capture/index')
            ->where('links.0.visits_count', 7));
});
