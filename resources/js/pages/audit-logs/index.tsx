import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type WorkspaceOption = { id: number; name: string; role: string };

type AuditEntry = {
    id: number;
    event: string;
    subject_type: string;
    subject_id: number | null;
    metadata: Record<string, string | number | boolean | null> | null;
    created_at: string | null;
    actor: string;
};

type PageProps = {
    workspace: { id: number; name: string };
    workspaces: WorkspaceOption[];
    logs: {
        data: AuditEntry[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

export default function AuditLogsIndex({
    workspace,
    workspaces,
    logs,
}: PageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Audit logs', href: '/audit-logs?workspace_id=' + workspace.id },
            ]}
        >
            <Head title="Audit logs" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Audit logs
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Important actions in {workspace.name}.
                        </p>
                    </div>
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className="mt-1 block min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={workspace.id}
                            onChange={(event) =>
                                router.get(
                                    '/audit-logs',
                                    { workspace_id: Number(event.target.value) },
                                    { preserveState: false, replace: true },
                                )
                            }
                        >
                            {workspaces.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.role})
                                </option>
                            ))}
                        </select>
                    </label>
                </header>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="border-b p-4">
                        <p className="text-sm text-muted-foreground">
                            {logs.total} recorded events. Passwords, tokens,
                            message contents, and customer contact details are
                            not included in audit metadata.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Time</th>
                                    <th className="px-4 py-3 font-medium">Actor</th>
                                    <th className="px-4 py-3 font-medium">Event</th>
                                    <th className="px-4 py-3 font-medium">Subject</th>
                                    <th className="px-4 py-3 font-medium">Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.data.map((entry) => (
                                    <tr key={entry.id} className="align-top">
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {entry.created_at
                                                ? new Date(entry.created_at).toLocaleString()
                                                : 'Time unavailable'}
                                        </td>
                                        <td className="px-4 py-3">{entry.actor}</td>
                                        <td className="px-4 py-3 font-medium">
                                            {entry.event}
                                        </td>
                                        <td className="px-4 py-3">
                                            {entry.subject_type}
                                            {entry.subject_id
                                                ? ' #' + entry.subject_id
                                                : ''}
                                        </td>
                                        <td className="max-w-sm px-4 py-3">
                                            {entry.metadata
                                                ? Object.entries(entry.metadata)
                                                      .map(([key, value]) => key + ': ' + String(value ?? '—'))
                                                      .join(' · ')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No audit events recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {logs.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {logs.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                    className={
                                        'rounded-md border px-3 py-1 text-sm disabled:opacity-40 ' +
                                        (link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : '')
                                    }
                                >
                                    {link.label
                                        .replace(/&laquo;|&raquo;/g, '')
                                        .replace(/&amp;/g, '&')}
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
