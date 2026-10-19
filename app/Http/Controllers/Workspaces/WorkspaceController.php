<?php

namespace App\Http\Controllers\Workspaces;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function index(Request $request): Response
    {
        $workspaces = $request->user()
            ->workspaces()
            ->withPivot('role')
            ->withCount('members')
            ->orderBy('workspaces.name')
            ->get()
            ->map(fn ($workspace) => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'description' => $workspace->description,
                'role' => $workspace->pivot->role,
                'members_count' => $workspace->members_count,
                'is_owner' => $workspace->owner_id === $request->user()->id,
                'created_at' => $workspace->created_at?->toIso8601String(),
            ]);

        return Inertia::render('workspaces/index', [
            'workspaces' => $workspaces,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            $workspace = $request->user()->ownedWorkspaces()->create($validated);

            $workspace->members()->attach($request->user()->id, [
                'role' => 'owner',
            ]);
        });

        return to_route('workspaces.index')->with('success', 'Workspace created successfully.');
    }
}
