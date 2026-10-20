import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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

const cardClass = 'rounded-xl border bg-card p-4';
const linkClass = 'mt-3 inline-block text-sm font-medium text-primary hover:underline';

function MetricCard({
    title,
    value,
    description,
    href,
    linkLabel,
}: {
    title: string;
    value: number;
    description: string;
    href?: string;
    linkLabel?: string;
}) {
    return (
        <article className={cardClass}>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            {href && linkLabel && (
                <a href={href} className={linkClass}>
                    {linkLabel}
                </a>
            )}
        </article>
    );
}

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
                { title: 'Dashboard', href: '/dashboard' + workspaceQuery },
            ]}
        >
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Operational dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Workspace: {workspace.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            30-day period: {definitions.period}
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

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <MetricCard
                        title="Customer records"
                        value={metrics.customers_total}
                        description={
                            metrics.customers_active + ' active. ' +
                            definitions.customers
                        }
                        href={'/customers' + workspaceQuery}
                        linkLabel="View customers"
                    />
                    <MetricCard
                        title="Interactions"
                        value={metrics.interactions_last_30_days}
                        description={definitions.interactions}
                        href={'/customers' + workspaceQuery}
                        linkLabel="Review activity"
                    />
                    <MetricCard
                        title="Active QR/NFC links"
                        value={metrics.capture_links_active}
                        description={definitions.capture_links}
                        href={'/capture-links?workspace_id=' + workspace.id}
                        linkLabel="Manage capture links"
                    />
                    <MetricCard
                        title="Overdue follow-ups"
                        value={metrics.follow_ups_overdue}
                        description={definitions.follow_ups}
                        href={
                            '/follow-ups' + workspaceQuery + '&filter=overdue'
                        }
                        linkLabel="Review overdue"
                    />
                    <MetricCard
                        title="Follow-ups due today"
                        value={metrics.follow_ups_today}
                        description="Scheduled and not marked completed."
                        href={'/follow-ups' + workspaceQuery + '&filter=today'}
                        linkLabel="Review today's follow-ups"
                    />
                    <article className={cardClass}>
                        <p className="font-medium">Metric coverage</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            QR/NFC scans and repeat visits are not counted.
                            Active links are not scan events or proof of a
                            verified visit.
                        </p>
                    </article>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">
                                Recent interactions
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest recorded interactions in this workspace.
                            </p>
                        </div>
                        <div className="divide-y">
                            {recentInteractions.map((interaction) => (
                                <article key={interaction.id} className="p-4">
                                    <p className="font-medium">
                                        {interaction.summary}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {interaction.customer ?? 'Customer'}
                                        {' · '}
                                        {interaction.type}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {interaction.occurred_at
                                            ? new Date(
                                                  interaction.occurred_at,
                                              ).toLocaleString()
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
                            <h2 className="font-semibold">
                                Follow-ups due today or overdue
                            </h2>
                        </div>
                        <div className="divide-y">
                            {dueFollowUps.map((followUp) => (
                                <article key={followUp.id} className="p-4">
                                    <p className="font-medium">
                                        {followUp.name}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {followUp.scheduled_at
                                            ? new Date(
                                                  followUp.scheduled_at,
                                              ).toLocaleString()
                                            : 'Schedule unavailable'}
                                    </p>
                                    {followUp.notes && (
                                        <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                                            {followUp.notes}
                                        </p>
                                    )}
                                </article>
                            ))}
                            {dueFollowUps.length === 0 && (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    No due follow-ups.
                                </p>
                            )}
                        </div>
                        <div className="border-t p-4">
                            <a
                                href={'/follow-ups' + workspaceQuery}
                                className={linkClass}
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
