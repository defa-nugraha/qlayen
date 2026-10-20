import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

type WorkspaceOption = { id: number; name: string; role: string };
type ConsentEntry = {
    id: number;
    channel: string;
    status: string;
    source: string;
    notice_version: string | null;
    recorded_at: string;
    customer: string;
    recorded_by: string;
};
type PageProps = {
    workspace: { id: number; name: string };
    workspaces: WorkspaceOption[];
    consents: {
        data: ConsentEntry[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

export default function CommunicationConsentsIndex({
    workspace,
    workspaces,
    consents,
}: PageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Communication consent',
                    href:
                        '/communication-consents?workspace_id=' + workspace.id,
                },
            ]}
        >
            <Head title="Communication consent" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Consent history
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Consent records for workspace {workspace.name}.
                        </p>
                    </div>
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className="mt-1 block min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={workspace.id}
                            onChange={(event) =>
                                router.get(
                                    '/communication-consents',
                                    {
                                        workspace_id: Number(
                                            event.target.value,
                                        ),
                                    },
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
                            {consents.total} recorded consent events. Missing
                            notice versions mean a version was not configured
                            when the record was created.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Recorded
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Channel
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Source
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Notice version
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Recorded by
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {consents.data.map((consent) => (
                                    <tr key={consent.id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(
                                                consent.recorded_at,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {consent.customer}
                                        </td>
                                        <td className="px-4 py-3">
                                            {consent.channel}
                                        </td>
                                        <td className="px-4 py-3">
                                            {consent.status}
                                        </td>
                                        <td className="px-4 py-3">
                                            {consent.source}
                                        </td>
                                        <td className="px-4 py-3">
                                            {consent.notice_version ??
                                                'Not configured'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {consent.recorded_by}
                                        </td>
                                    </tr>
                                ))}
                                {consents.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No consent events recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {consents.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {consents.links.map((link, index) => (
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
