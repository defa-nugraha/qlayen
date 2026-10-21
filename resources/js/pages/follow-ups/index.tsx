import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    follow_up_at: string;
    follow_up_notes: string | null;
};

type WorkspaceOption = { id: number; name: string; role: string };
type FollowUpFilter = 'overdue' | 'today' | 'upcoming' | 'all';

type PageProps = {
    workspaces: WorkspaceOption[];
    currentWorkspaceId: number;
    customers: {
        data: Customer[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { filter: FollowUpFilter; search: string };
    counts: { overdue: number; today: number; upcoming: number };
};

const filterOptions: { value: FollowUpFilter; label: string }[] = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due today' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'all', label: 'All scheduled' },
];

export default function FollowUpsIndex({
    customers,
    filters,
    counts,
    workspaces,
    currentWorkspaceId,
}: PageProps) {
    const [search, setSearch] = useState(filters.search);

    function navigate(next: {
        workspace_id?: number;
        filter?: FollowUpFilter;
        search?: string;
    }) {
        router.get(
            '/follow-ups',
            {
                workspace_id: next.workspace_id ?? currentWorkspaceId,
                filter: next.filter ?? filters.filter,
                search: next.search ?? search,
            },
            { preserveState: true, replace: true },
        );
    }

    function runSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        navigate({ search });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Follow-ups', href: '/follow-ups' }]}>
            <Head title="Follow-ups" />
            <div className="flex flex-col gap-6 p-4 md:p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Follow-up workflow
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review scheduled customer follow-ups and open
                            their interaction history. Eligible reminders can
                            be sent automatically through the configured
                            WhatsApp gateway.
                        </p>
                    </div>
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto sm:min-w-56"
                            value={currentWorkspaceId}
                            onChange={(event) =>
                                navigate({
                                    workspace_id: Number(event.target.value),
                                })
                            }
                        >
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                    {workspace.name} ({workspace.role})
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        { label: 'Overdue', value: counts.overdue },
                        { label: 'Due today', value: counts.today },
                        { label: 'Upcoming', value: counts.upcoming },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl border bg-card p-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-4 border-b p-4 md:p-5">
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        navigate({ filter: option.value })
                                    }
                                    aria-pressed={
                                        filters.filter === option.value
                                    }
                                    className={
                                        'rounded-md border px-3 py-2 text-sm ' +
                                        (filters.filter === option.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted')
                                    }
                                >
                                    {option.label}
                                    {option.value !== 'all' && (
                                        <span className="ml-2 opacity-75">
                                            {counts[option.value]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <form
                            onSubmit={runSearch}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <input
                                className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search name, phone, email, or follow-up note"
                                aria-label="Search follow-ups"
                            />
                            <button
                                type="submit"
                                className="min-h-10 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:self-start"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="space-y-3 p-3 md:hidden">
                        {customers.data.map((customer) => (
                            <article
                                key={customer.id}
                                className="rounded-xl border bg-background p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold break-words">
                                            {customer.name}
                                        </h3>
                                        <p className="mt-1 text-sm break-words text-muted-foreground">
                                            {customer.phone ??
                                                customer.email ??
                                                'No contact details'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium">
                                        {new Date(
                                            customer.follow_up_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Scheduled for
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {new Date(
                                            customer.follow_up_at,
                                        ).toLocaleString()}
                                    </p>
                                    <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Follow-up note
                                    </p>
                                    <p className="mt-1 text-sm break-words text-muted-foreground">
                                        {customer.follow_up_notes ||
                                            'No note added'}
                                    </p>
                                </div>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    <a
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        href={
                                            '/customers/' +
                                            customer.id +
                                            '/interactions?workspace_id=' +
                                            currentWorkspaceId
                                        }
                                    >
                                        Interaction history
                                    </a>
                                    <button
                                        type="button"
                                        className="min-h-10 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        onClick={() =>
                                            router.patch(
                                                '/follow-ups/' +
                                                    customer.id +
                                                    '/complete',
                                                {
                                                    workspace_id:
                                                        currentWorkspaceId,
                                                    filter: filters.filter,
                                                    search: filters.search,
                                                },
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        Mark completed
                                    </button>
                                </div>
                            </article>
                        ))}
                        {customers.data.length === 0 && (
                            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No scheduled follow-ups match this view.
                            </div>
                        )}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Scheduled for
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Follow-up note
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {customer.name}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {customer.phone ??
                                                    customer.email ??
                                                    'No contact details'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(
                                                customer.follow_up_at,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="max-w-sm px-4 py-3 whitespace-pre-wrap text-muted-foreground">
                                            {customer.follow_up_notes || '—'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-2">
                                                <a
                                                    className="font-medium text-primary hover:underline"
                                                    href={
                                                        '/customers/' +
                                                        customer.id +
                                                        '/interactions?workspace_id=' +
                                                        currentWorkspaceId
                                                    }
                                                >
                                                    Interaction history
                                                </a>
                                                <button
                                                    type="button"
                                                    className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                                    onClick={() =>
                                                        router.patch(
                                                            '/follow-ups/' +
                                                                customer.id +
                                                                '/complete',
                                                            {
                                                                workspace_id:
                                                                    currentWorkspaceId,
                                                                filter: filters.filter,
                                                                search: filters.search,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    Mark completed
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No scheduled follow-ups match this
                                            view.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                        <p className="text-sm text-muted-foreground">
                            {customers.total} scheduled follow-up
                            {customers.total === 1 ? '' : 's'}
                        </p>
                        {customers.last_page > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {customers.links.map((link, index) => (
                                    <button
                                        key={index}
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
                                        type="button"
                                    >
                                        {link.label
                                            .replace(/&laquo;|&raquo;/g, '')
                                            .replace(/&amp;/g, '&')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
