import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    source: string | null;
    notes: string | null;
    follow_up_at: string | null;
    follow_up_notes: string | null;
    follow_up_whatsapp_enabled: boolean;
    status: 'active' | 'inactive';
};

type WorkspaceOption = { id: number; name: string; role: string };

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
    filters: { search: string };
};

type CustomerForm = {
    workspace_id: number;
    name: string;
    phone: string;
    email: string;
    source: string;
    notes: string;
    follow_up_at: string;
    follow_up_notes: string;
    follow_up_whatsapp_enabled: boolean;
    status: 'active' | 'inactive';
};

const emptyForm: CustomerForm = {
    workspace_id: 0,
    name: '',
    phone: '',
    email: '',
    source: '',
    notes: '',
    follow_up_at: '',
    follow_up_notes: '',
    follow_up_whatsapp_enabled: false,
    status: 'active',
};

export default function CustomersIndex({
    customers,
    filters,
    workspaces,
    currentWorkspaceId,
}: PageProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search);
    const form = useForm<CustomerForm>({
        ...emptyForm,
        workspace_id: currentWorkspaceId,
    });

    function beginEdit(customer: Customer) {
        setEditingId(customer.id);
        form.setData({
            ...emptyForm,
            workspace_id: currentWorkspaceId,
            name: customer.name,
            phone: customer.phone ?? '',
            email: customer.email ?? '',
            source: customer.source ?? '',
            notes: customer.notes ?? '',
            follow_up_at: customer.follow_up_at
                ? customer.follow_up_at.slice(0, 16)
                : '',
            follow_up_notes: customer.follow_up_notes ?? '',
            follow_up_whatsapp_enabled: customer.follow_up_whatsapp_enabled,
            status: customer.status,
        });
        form.clearErrors();
    }

    function resetForm() {
        setEditingId(null);
        form.setData({ ...emptyForm, workspace_id: currentWorkspaceId });
        form.clearErrors();
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = { onSuccess: resetForm };
        if (editingId !== null) {
            form.put('/customers/' + editingId, options);
        } else {
            form.post('/customers', options);
        }
    }

    function runSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            '/customers',
            { search, workspace_id: currentWorkspaceId },
            { preserveState: true, replace: true },
        );
    }

    function removeCustomer(id: number) {
        if (
            window.confirm(
                'Delete this customer? This action cannot be undone.',
            )
        ) {
            router.delete('/customers/' + id, {
                data: { workspace_id: currentWorkspaceId },
            });
        }
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
    const labelClass = 'block text-sm font-medium text-foreground';

    return (
        <AppLayout breadcrumbs={[{ title: 'Customers', href: '/customers' }]}>
            <Head title="Customers" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className="mt-1 block min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={currentWorkspaceId}
                            onChange={(event) =>
                                router.get(
                                    '/customers',
                                    {
                                        workspace_id: Number(
                                            event.target.value,
                                        ),
                                        search,
                                    },
                                    { preserveState: false, replace: true },
                                )
                            }
                        >
                            {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                    {workspace.name} ({workspace.role})
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Customer CRM
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage customer details, interaction notes, and
                                follow-up dates.
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Total customers
                            </p>
                            <p className="text-2xl font-semibold">
                                {customers.total}
                            </p>
                        </div>
                    </div>
                </div>

                <section className="rounded-xl border bg-card p-4 md:p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        {editingId === null ? 'Add customer' : 'Edit customer'}
                    </h2>
                    <form
                        onSubmit={submit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <label className={labelClass}>
                            Full name *
                            <input
                                className={inputClass}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                                maxLength={255}
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Phone
                            <input
                                className={inputClass}
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData('phone', event.target.value)
                                }
                                maxLength={32}
                            />
                            {form.errors.phone && (
                                <span className="text-sm text-destructive">
                                    {form.errors.phone}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Email
                            <input
                                type="email"
                                className={inputClass}
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                maxLength={255}
                            />
                            {form.errors.email && (
                                <span className="text-sm text-destructive">
                                    {form.errors.email}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Acquisition source
                            <input
                                className={inputClass}
                                placeholder="e.g. QR, NFC, referral, walk-in"
                                value={form.data.source}
                                onChange={(event) =>
                                    form.setData('source', event.target.value)
                                }
                                maxLength={100}
                            />
                            {form.errors.source && (
                                <span className="text-sm text-destructive">
                                    {form.errors.source}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Follow-up date
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={form.data.follow_up_at}
                                onChange={(event) =>
                                    form.setData(
                                        'follow_up_at',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.follow_up_at && (
                                <span className="text-sm text-destructive">
                                    {form.errors.follow_up_at}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Status
                            <select
                                className={inputClass}
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData(
                                        'status',
                                        event.target
                                            .value as CustomerForm['status'],
                                    )
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                        <label className={labelClass}>
                            Interaction notes
                            <textarea
                                className={inputClass}
                                rows={3}
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                                maxLength={10000}
                            />
                            {form.errors.notes && (
                                <span className="text-sm text-destructive">
                                    {form.errors.notes}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Follow-up notes
                            <textarea
                                className={inputClass}
                                rows={3}
                                value={form.data.follow_up_notes}
                                onChange={(event) =>
                                    form.setData(
                                        'follow_up_notes',
                                        event.target.value,
                                    )
                                }
                                maxLength={10000}
                            />
                            {form.errors.follow_up_notes && (
                                <span className="text-sm text-destructive">
                                    {form.errors.follow_up_notes}
                                </span>
                            )}
                        </label>
                        <label className="flex items-start gap-3 text-sm md:col-span-2">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={form.data.follow_up_whatsapp_enabled}
                                onChange={(event) =>
                                    form.setData(
                                        'follow_up_whatsapp_enabled',
                                        event.target.checked,
                                    )
                                }
                            />
                            <span>
                                Customer has explicitly agreed to receive automated WhatsApp follow-up.
                                <span className="mt-1 block text-xs text-muted-foreground">
                                    Only use this after the customer has agreed to receive WhatsApp follow-up messages. A scheduled date, phone number, and recorded consent are also required.
                                </span>
                                {form.errors.follow_up_whatsapp_enabled && (
                                    <span className="block text-sm text-destructive">
                                        {form.errors.follow_up_whatsapp_enabled}
                                    </span>
                                )}
                            </span>
                        </label>
                        <div className="flex flex-wrap gap-2 md:col-span-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Saving…'
                                    : editingId === null
                                      ? 'Save customer'
                                      : 'Update customer'}
                            </button>
                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-md border px-4 py-2 text-sm"
                                >
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                        <h2 className="text-lg font-semibold">Customer list</h2>
                        <form onSubmit={runSearch} className="flex gap-2">
                            <input
                                aria-label="Search customers"
                                className="w-52 rounded-md border bg-background px-3 py-2 text-sm"
                                placeholder="Name, phone, or email"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                            <button
                                className="rounded-md border px-3 py-2 text-sm"
                                type="submit"
                            >
                                Search
                            </button>
                            {filters.search && (
                                <button
                                    className="rounded-md border px-3 py-2 text-sm"
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get('/customers', {
                                            workspace_id: currentWorkspaceId,
                                        });
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Source
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Follow-up
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="align-top">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {customer.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {customer.phone || 'No phone'}
                                                {customer.email
                                                    ? ' · ' + customer.email
                                                    : ''}
                                            </p>
                                            {customer.notes && (
                                                <p className="mt-1 max-w-md text-xs whitespace-pre-wrap text-muted-foreground">
                                                    {customer.notes}
                                                </p>
                                            )}
                                            {customer.follow_up_notes && (
                                                <p className="mt-1 max-w-md text-xs">
                                                    Follow-up:{' '}
                                                    {customer.follow_up_notes}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {customer.source || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {customer.follow_up_at
                                                ? new Date(
                                                      customer.follow_up_at,
                                                  ).toLocaleString()
                                                : 'Not scheduled'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    customer.status === 'active'
                                                        ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                                        : 'rounded-full bg-muted px-2 py-1 text-xs'
                                                }
                                            >
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.get(
                                                        '/customers/' +
                                                            customer.id +
                                                            '/interactions',
                                                        {
                                                            workspace_id:
                                                                currentWorkspaceId,
                                                        },
                                                    )
                                                }
                                                className="mr-3 text-primary hover:underline"
                                            >
                                                History
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    beginEdit(customer)
                                                }
                                                className="mr-3 text-primary hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeCustomer(customer.id)
                                                }
                                                className="text-destructive hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No customers yet. Add your first
                                            customer above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {customers.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
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
                </section>
            </div>
        </AppLayout>
    );
}
