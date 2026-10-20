import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type WorkspaceOption = { id: number; name: string; role: string };

type DashboardProps = {
    workspace: { id: number; name: string; role: string | null };
    workspaces: WorkspaceOption[];
    metrics: {
        customers_total: number;
        customers_active: number;
        interactions_last_30_days: number;
        capture_links_active: number;
        follow_ups_overdue: number;
        follow_ups_today: number;
    };
    definitions: {
        period: string;
        customers: string;
        interactions: string;
        capture_links: string;
        follow_ups: string;
    };
    recentInteractions: {
        id: number;
        type: string;
        summary: string;
        occurred_at: string | null;
        customer: string | null;
        actor: string | null;
    }[];
    dueFollowUps: {
        id: number;
        name: string;
        scheduled_at: string | null;
        notes: string | null;
    }[];
};

const metricClass = 'rounded-xl border bg-card p-4 md:p-5';

export default function Dashboard({
    workspace,
    workspaces,
    metrics,
    definitions,
    recentInteractions,
    dueFollowUps,
}: DashboardProps) {
    const workspaceQuery = '?workspace_id=' + workspace.id;

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Dashboard',
                    href: dashboard({ query: { workspace_id: workspace.id } }),
                },
            ]}
        >
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Operational dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Workspace metrics for {workspace.name}.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            30-day interaction period: {definitions.period}
                        </p>
                    </div>
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className="mt-1 block min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={workspace.id}
                            onChange={(event) =>
                                router.get(
                                    '/dashboard',
                                    {\n                                        workspace_id: Number(event.target.value),\n                                    },
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
                </div>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <article className={metricClass}>
                        <p className="text-sm text-muted-foreground">
                            Customer records
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                            {metrics.customers_total}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {metrics.customers_active} active
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {definitions.customers}
                        </p>
                        <a
                            href={'/customers' + workspaceQuery}
                            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            View customers
                        </a>
                    </article>
                    <article className={metricClass}>
                        <p className="text-sm text-muted-foreground">
                            Interactions
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                            {metrics.interactions_last_30_days}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Last 30 calendar days
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {definitions.interactions}
                        </p>
                        <a
                            href={'/customers' + workspaceQuery}
                            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            Review customer activity
                        </a>
                    </article>
                    <article className={metricClass}>
                        <p className="text-sm text-muted-foreground">
                            Active QR/NFC links
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                            {metrics.capture_links_active}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {definitions.capture_links}
                        </p>
                        <a
                            href="/capture-links"
                            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            Manage capture links
                        </a>
                    </article>
                    <article className={metricClass}>
                        <p className="text-sm text-muted-foreground">
                            Overdue follow-ups
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                            {metrics.follow_ups_overdue}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {definitions.follow_ups}
                        </p>
                        <a
                            href={'/follow-ups' + workspaceQuery + '&filter=overdue'}
                            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            Review overdue
                        </a>
                    </article>
                    <article className={metricClass}>
                        <p className="text-sm text-muted-foreground">
                            Follow-ups due today
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                            {metrics.follow_ups_today}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Scheduled and not marked completed.
                        </p>
                        <a
                            href={'/follow-ups' + workspaceQuery + '&filter=today'}
                            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                        >
                            Review today's follow-ups
                        </a>
                    </article>
                    <article className={metricClass}>
                        <p className="text-sm font-medium">Metric coverage</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            QR/NFC scans and repeat visits are not counted yet.
                            Active links are not scan events, and a customer
                            record is not proof of a verified visit.
                        </p>
                    </article>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Recent interactions</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest recorded customer interactions in this workspace.
                            </p>
                        </div>
                        <div className="divide-y">
                            {recentInteractions.map((interaction) => (
                                <article key={interaction.id} className="p-4">
                                    <p className="font-medium">\n                                        {interaction.summary}\n                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {interaction.customer ??\n                                            'Customer record unavailable'}
                                        {' · '}
                                        {interaction.type}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {interaction.occurred_at
                                            ? new Date(\n                                                  interaction.occurred_at,\n                                              ).toLocaleString()
                                            : 'Time unavailable'}
                                        {' · '}
                                        {interaction.actor ?? 'Former user'}
                                    </p>
                                </article>
                            ))}
                            {recentInteractions.length === 0 && (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    No interactions recorded yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border bg-card">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">\n                                Follow-ups due today or overdue\n                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Scheduled follow-ups that have not been completed.
                            </p>
                        </div>
                        <div className="divide-y">
                            {dueFollowUps.map((followUp) => (
                                <article key={followUp.id} className="p-4">
                                    <p className="font-medium">\n                                        {followUp.name}\n                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {followUp.scheduled_at
                                            ? new Date(\n                                                  followUp.scheduled_at,\n                                              ).toLocaleString()
                                            : 'Schedule unavailable'}
                                    </p>
                                    {followUp.notes && (
                                        <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                                            {followUp.notes}
                                        </p>
                                    )}
                                    <a
                                        href={'/customers' + workspaceQuery}
                                        className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                                    >
                                        Open customer list
                                    </a>
                                </article>
                            ))}
                            {dueFollowUps.length === 0 && (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    No overdue or due-today follow-ups.
                                </p>
                            )}
                        </div>
                        <div className="border-t p-4">
                            <a
                                href={'/follow-ups' + workspaceQuery}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Open follow-up workflow
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
