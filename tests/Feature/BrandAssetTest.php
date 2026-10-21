<?php

use App\Models\BrandAsset;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function createBrandAssetWorkspace(User $user, string $role = 'owner'): Workspace
{
    $workspace = Workspace::query()->create(['owner_id' => $user->id, 'name' => 'Brand workspace']);
    $workspace->members()->attach($user->id, ['role' => $role]);

    return $workspace;
}

it('renders all logo placements when no custom logos have been uploaded', function () {
    $owner = User::factory()->create();
    $workspace = createBrandAssetWorkspace($owner);

    $this->actingAs($owner)
        ->get(route('brand-assets.index', ['workspace_id' => $workspace->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('brand-assets/index')
            ->has('placements', 4)
            ->where('placements.0.key', 'public_header')
            ->where('placements.0.url', null)
            ->where('placements.0.alt_text', '')
            ->where('placements.0.updated_at', null));
});

it('allows a workspace owner to upload a brand logo', function () {
    Storage::fake('public');
    $owner = User::factory()->create();
    $workspace = createBrandAssetWorkspace($owner);

    $this->actingAs($owner)->post(route('brand-assets.store'), [
        'workspace_id' => $workspace->id,
        'key' => 'public_header',
        'logo' => UploadedFile::fake()->image('logo.png'),
        'alt_text' => 'QLayen logo',
    ])->assertRedirect(route('brand-assets.index', ['workspace_id' => $workspace->id]));

    $asset = BrandAsset::query()->where('key', 'public_header')->firstOrFail();
    expect($asset->alt_text)->toBe('QLayen logo');
    Storage::disk('public')->assertExists($asset->path);
});

it('rejects brand logo management for workspace members', function () {
    Storage::fake('public');
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::query()->create(['owner_id' => $owner->id, 'name' => 'Brand workspace']);
    $workspace->members()->attach($owner->id, ['role' => 'owner']);
    $workspace->members()->attach($member->id, ['role' => 'member']);

    $this->actingAs($member)->post(route('brand-assets.store'), [
        'workspace_id' => $workspace->id,
        'key' => 'public_header',
        'logo' => UploadedFile::fake()->image('logo.png'),
    ])->assertForbidden();

    expect(BrandAsset::query()->count())->toBe(0);
});

it('rejects unsupported brand logo formats', function () {
    Storage::fake('public');
    $owner = User::factory()->create();
    $workspace = createBrandAssetWorkspace($owner);

    $this->actingAs($owner)->post(route('brand-assets.store'), [
        'workspace_id' => $workspace->id,
        'key' => 'public_header',
        'logo' => UploadedFile::fake()->create('logo.svg', 10, 'image/svg+xml'),
    ])->assertSessionHasErrors('logo');
});
