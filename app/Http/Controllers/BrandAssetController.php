<?php

namespace App\Http\Controllers;

use App\Models\BrandAsset;
use App\Models\Workspace;
use App\Support\WorkspaceContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BrandAssetController extends Controller
{
    public function index(Request $request, WorkspaceContext $workspaceContext): Response
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $this->authorizeManager($workspace, $request);

        $assets = BrandAsset::query()->get()->keyBy('key');

        return Inertia::render('brand-assets/index', [
            'placements' => collect(BrandAsset::PLACEMENTS)->map(fn (string $label, string $key) => [
                'key' => $key,
                'label' => $label,
                'url' => isset($assets[$key]) ? Storage::disk('public')->url($assets[$key]->path) : null,
                'alt_text' => $assets[$key]->alt_text ?? '',
                'updated_at' => $assets[$key]->updated_at?->toIso8601String(),
            ])->values(),
            'workspaces' => $request->user()->workspaces()
                ->orderBy('workspaces.name')
                ->get()
                ->map(fn (Workspace $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'role' => $item->pivot->role,
                ]),
            'currentWorkspaceId' => $workspace->id,
        ]);
    }

    public function store(Request $request, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->input('workspace_id'));
        $this->authorizeManager($workspace, $request);

        $validated = $request->validate([
            'key' => ['required', 'string', Rule::in(array_keys(BrandAsset::PLACEMENTS))],
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp,ico', 'max:2048'],
            'alt_text' => ['nullable', 'string', 'max:160'],
        ]);

        $path = $request->file('logo')->store('brand-assets', 'public');
        $asset = BrandAsset::query()->where('key', $validated['key'])->first();
        $oldPath = $asset?->path;

        BrandAsset::query()->updateOrCreate(
            ['key' => $validated['key']],
            [
                'label' => BrandAsset::PLACEMENTS[$validated['key']],
                'path' => $path,
                'alt_text' => $validated['alt_text'] ?? null,
                'updated_by_user_id' => $request->user()->id,
            ],
        );

        if ($oldPath && $oldPath !== $path) {
            Storage::disk('public')->delete($oldPath);
        }

        return to_route('brand-assets.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Logo berhasil diperbarui.');
    }

    public function destroy(Request $request, string $key, WorkspaceContext $workspaceContext): RedirectResponse
    {
        $workspace = $workspaceContext->resolve($request, $request->query('workspace_id'));
        $this->authorizeManager($workspace, $request);

        abort_unless(array_key_exists($key, BrandAsset::PLACEMENTS), 404);

        $asset = BrandAsset::query()->where('key', $key)->firstOrFail();
        Storage::disk('public')->delete($asset->path);
        $asset->delete();

        return to_route('brand-assets.index', ['workspace_id' => $workspace->id])
            ->with('success', 'Logo dihapus. Tampilan kembali menggunakan logo bawaan.');
    }

    private function authorizeManager(\App\Models\Workspace $workspace, Request $request): void
    {
        $role = $workspace->members()
            ->whereKey($request->user()->id)
            ->first()?->pivot?->role;

        abort_unless(in_array($role, ['owner', 'admin'], true), 403);
    }
}
