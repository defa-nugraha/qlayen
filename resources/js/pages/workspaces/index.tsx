import { Head, useForm } from '@inertiajs/react';
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

    const inputClass =
        'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    return (
        <AppLayout breadcrumbs={[{ title: 'Workspaces', href: '/workspaces' }]}>
            <Head title="Business workspaces" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Business workspaces
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Create a shared business space as the foundation for
                        team access and workspace-level customer data.
                    </p>
                </div>

                <section className="rounded-xl border bg-card p-4 md:p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        Create workspace
                    </h2>
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <label className="block text-sm font-medium">
                            Business or workspace name *
                            <input
                                className={inputClass}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                maxLength={120}
                                required
                                placeholder="e.g. Kopi Nusantara"
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className="block text-sm font-medium">
                            Description (optional)
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
                                placeholder="Describe this business or team."
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
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Creating…'
                                    : 'Create workspace'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Your workspaces</h2>
                    {workspaces.length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            You do not belong to a workspace yet. Create one to
                            establish a business workspace.
                        </div>
                    )}
                    {workspaces.map((workspace) => (
                        <article
                            key={workspace.id}
                            className="rounded-xl border bg-card p-4 md:p-5"
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
                        </article>
                    ))}
                </section>

                <p className="text-xs leading-relaxed text-muted-foreground">
                    Workspace creation and membership records are implemented in
                    this stage. Customer and capture-link data still use
                    account-level ownership until the workspace migration and
                    access controls are completed.
                </p>
            </div>
        </AppLayout>
    );
}
