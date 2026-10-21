import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type Workspace = {
    id: number;
    name: string;
    description: string | null;
    role: 'owner' | 'admin' | 'member';
    members_count: number;
    is_owner: boolean;
    created_at: string | null;
    members: {
        id: number;
        name: string;
        email: string;
        role: 'owner' | 'admin' | 'member';
        is_owner: boolean;
    }[];
};

export default function WorkspacesIndex({
    workspaces,
}: {
    workspaces: Workspace[];
}) {
    const form = useForm<{ name: string; description: string }>({
        name: '',
        description: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/workspaces', {
            onSuccess: () => form.reset(),
        });
    }

    function updateMemberRole(
        workspace: Workspace,
        memberId: number,
        role: string,
    ) {
        router.put(
            '/workspaces/' + workspace.id + '/members/' + memberId,
            { role },
            { preserveScroll: true },
        );
    }

    function removeMember(workspace: Workspace, memberId: number) {
        router.delete('/workspaces/' + workspace.id + '/members/' + memberId, {
            preserveScroll: true,
        });
    }

    const inputClass =
        'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none';

    return (
        <AppLayout breadcrumbs={[{ title: 'Workspaces', href: '/workspaces' }]}>
            <Head title="Workspace bisnis" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-5 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Business workspaces
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Create a shared business space as the foundation for
                        team access and workspace-level customer data.
                    </p>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Buat workspace
                    </h2>
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <label className="block text-sm font-medium">
                            Nama bisnis atau workspace *
                            <input
                                className={inputClass}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                maxLength={120}
                                required
                                placeholder="Contoh: Kopi Nusantara"
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className="block text-sm font-medium">
                            Deskripsi (opsional)
                            <textarea
                                className={inputClass}
                                rows={3}
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                maxLength={2000}
                                placeholder="Jelaskan bisnis atau tim ini."
                            />
                            {form.errors.description && (
                                <span className="text-sm text-destructive">
                                    {form.errors.description}
                                </span>
                            )}
                        </label>
                        <div>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Membuat...'
                                    : 'Buat workspace'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Workspace Anda</h2>
                    {workspaces.length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            You do not belong to a workspace yet. Create one to
                            establish a business workspace.
                        </div>
                    )}
                    {workspaces.map((workspace) => (
                        <article
                            key={workspace.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {workspace.name}
                                    </h3>
                                    {workspace.description && (
                                        <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                                            {workspace.description}
                                        </p>
                                    )}
                                </div>
                                <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                                    {workspace.role}
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                <span>
                                    {workspace.members_count}{' '}
                                    {workspace.members_count === 1
                                        ? 'member'
                                        : 'members'}
                                </span>
                                <span>
                                    {workspace.is_owner
                                        ? 'You own this workspace'
                                        : 'Shared workspace'}
                                </span>
                            </div>
                            <div className="mt-5 border-t pt-4">
                                <h4 className="mb-3 text-sm font-semibold">
                                    Workspace members
                                </h4>
                                <div className="flex flex-col gap-3">
                                    {workspace.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex flex-wrap items-center justify-between gap-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {member.name}
                                                    {member.is_owner
                                                        ? ' (owner)'
                                                        : ''}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                            {workspace.is_owner &&
                                            !member.is_owner ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                                                        value={member.role}
                                                        aria-label={
                                                            'Role for ' +
                                                            member.name
                                                        }
                                                        onChange={(event) =>
                                                            updateMemberRole(
                                                                workspace,
                                                                member.id,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    >
                                                        <option value="admin">
                                                            Admin
                                                        </option>
                                                        <option value="member">
                                                            Member
                                                        </option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="rounded-md border px-3 py-1.5 text-sm text-destructive"
                                                        onClick={() =>
                                                            removeMember(
                                                                workspace,
                                                                member.id,
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                                                    {member.role}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {!workspace.is_owner && (
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Only the workspace owner can change
                                        member roles or remove members.
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </section>

                <p className="text-xs leading-relaxed text-muted-foreground">
                    Only the workspace owner can change member roles or remove
                    members. Invitations and ownership transfer are not yet
                    available.
                </p>
            </div>
        </AppLayout>
    );
}
