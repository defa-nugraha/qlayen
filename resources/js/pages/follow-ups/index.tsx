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
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Follow-up workflow
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review scheduled customer follow-ups and open their
                            interaction history. This view does not send
                            reminders automatically.
                        </p>
                    </div>
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className="mt-1 block min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                        <div key={item.label} className="rounded-xl border bg-card p-4">
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
                                    onClick={() => navigate({ filter: option.value })}
                                    aria-pressed={filters.filter === option.value}
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
                        <form onSubmit={runSearch} className="flex gap-2">
                            <input
                                className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name, phone, email, or follow-up note"
                                aria-label="Search follow-ups"
                            />
                            <button
                                type="submit"
                                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Scheduled for</th>
                                    <th className="px-4 py-3 font-medium">Follow-up note</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {customer.phone ?? customer.email ?? 'No contact details'}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {new Date(customer.follow_up_at).toLocaleString()}
                                        </td>
                                        <td className="max-w-sm px-4 py-3 whitespace-pre-wrap text-muted-foreground">
                                            {customer.follow_up_notes || '—'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <a
                                                className="font-medium text-primary hover:underline"
                                                href={'/customers/' + customer.id + '/interactions?workspace_id=' + currentWorkspaceId}
                                            >
                                                Interaction history
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                            No scheduled follow-ups match this view.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                        <p className="text-sm text-muted-foreground">
                            {customers.total} scheduled follow-up{customers.total === 1 ? '' : 's'}
                        </p>
                        {customers.last_page > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {customers.links.map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className={
                                            'rounded-md border px-3 py-1 text-sm disabled:opacity-40 ' +
                                            (link.active ? 'bg-primary text-primary-foreground' : '')
                                        }
                                        type="button"
                                    >
                                        {link.label.replace(/&laquo;|&raquo;/g, '').replace(/&amp;/g, '&')}
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
