<?php

namespace App\Http\Controllers\Workspaces;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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
            ->map(fn (Workspace $workspace) => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'description' => $workspace->description,
                'role' => $workspace->pivot->role,
                'members_count' => $workspace->members_count,
                'is_owner' => $workspace->owner_id === $request->user()->id,
                'created_at' => $workspace->created_at?->toIso8601String(),
                'members' => $workspace->members()
                    ->orderBy('users.name')
                    ->get(['users.id', 'users.name', 'users.email'])
                    ->map(fn ($member) => [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'role' => $member->pivot->role,
                        'is_owner' => $workspace->owner_id === $member->id,
                    ]),
            ]);

        return Inertia::render('workspaces/index', [
            'workspaces' => $workspaces,
        ]);
    }

    public function update(Request $request, Workspace $workspace): RedirectResponse
    {
        abort_unless($workspace->owner_id === $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $workspace->update($validated);

        return to_route('workspaces.index')->with('success', 'Workspace settings updated.');
    }

    public function updateMember(Request $request, Workspace $workspace, int $user): RedirectResponse
    {
        abort_unless($workspace->owner_id === $request->user()->id, 403);

        $membership = $workspace->members()->whereKey($user)->firstOrFail();
        abort_if($workspace->owner_id === $membership->id, 422, 'The workspace owner role cannot be changed.');

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'member'])],
        ]);

        $workspace->members()->updateExistingPivot($user, ['role' => $validated['role']]);

        return to_route('workspaces.index')->with('success', 'Workspace member role updated.');
    }

    public function destroyMember(Request $request, Workspace $workspace, int $user): RedirectResponse
    {
        abort_unless($workspace->owner_id === $request->user()->id, 403);

        $membership = $workspace->members()->whereKey($user)->firstOrFail();
        abort_if($workspace->owner_id === $membership->id, 422, 'The workspace owner cannot be removed.');

        $workspace->members()->detach($user);

        return to_route('workspaces.index')->with('success', 'Workspace member removed.');
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
