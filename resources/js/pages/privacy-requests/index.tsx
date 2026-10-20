import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type RequestType = 'access' | 'correction' | 'deletion';
type RequestStatus = 'pending' | 'in_review' | 'completed' | 'rejected';

type WorkspaceOption = { id: number; name: string; role: string };
type CustomerOption = { id: number; name: string };
type PrivacyRequest = {
    id: number;
    request_type: RequestType;
    status: RequestStatus;
    details: string | null;
    resolution_note: string | null;
    created_at: string | null;
    resolved_at: string | null;
    customer: string | null;
    requested_by: string;
    resolved_by: string | null;
};

type PageProps = {
    workspace: { id: number; name: string };
    workspaces: WorkspaceOption[];
    customers: CustomerOption[];
    canResolve: boolean;
    requests: {
        data: PrivacyRequest[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

const inputClass =
    'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
const requestTypes: { value: RequestType; label: string }[] = [
    { value: 'access', label: 'Access' },
    { value: 'correction', label: 'Correction' },
    { value: 'deletion', label: 'Deletion' },
];

function RequestResolutionForm({
    item,
    workspaceId,
}: {
    item: PrivacyRequest;
    workspaceId: number;
}) {
    const form = useForm({
        workspace_id: workspaceId,
        status: 'in_review' as RequestStatus,
        resolution_note: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.patch('/privacy-requests/' + item.id, {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className="flex min-w-56 flex-col gap-2">
            <select
                className={inputClass}
                value={form.data.status}
                onChange={(event) =>
                    form.setData('status', event.target.value as RequestStatus)
                }
            >
                <option value="in_review">In review</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
            </select>
            <textarea
                className={inputClass}
                rows={2}
                value={form.data.resolution_note}
                onChange={(event) =>
                    form.setData('resolution_note', event.target.value)
                }
                placeholder="Resolution note; required for rejection"
                maxLength={2000}
            />
            {form.errors.resolution_note && (
                <p className="text-xs text-destructive">
                    {form.errors.resolution_note}
                </p>
            )}
            <button
                type="submit"
                disabled={form.processing}
                className="rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
                Update status
            </button>
        </form>
    );
}

export default function PrivacyRequestsIndex({
    workspace,
    workspaces,
    customers,
    canResolve,
    requests,
}: PageProps) {
    const form = useForm({
        workspace_id: workspace.id,
        customer_id: '',
        request_type: 'access' as RequestType,
        details: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/privacy-requests', {
            preserveScroll: true,
            onSuccess: () => form.reset('customer_id', 'details'),
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Privacy requests',
                    href: '/privacy-requests?workspace_id=' + workspace.id,
                },
            ]}
        >
            <Head title="Privacy requests" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Privacy requests
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track access, correction, and deletion requests for
                            workspace {workspace.name}.
                        </p>
                    </div>
                    <label className="block text-sm font-medium">
                        Active workspace
                        <select
                            className={inputClass}
                            value={workspace.id}
                            onChange={(event) =>
                                router.get(
                                    '/privacy-requests',
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

                <section className="rounded-xl border bg-card p-4 md:p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        Record a privacy request
                    </h2>
                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-medium">
                            Related customer (optional)
                            <select
                                className={inputClass}
                                value={form.data.customer_id}
                                onChange={(event) =>
                                    form.setData('customer_id', event.target.value)
                                }
                            >
                                <option value="">Not linked to a profile</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.customer_id && (
                                <span className="text-sm text-destructive">
                                    {form.errors.customer_id}
                                </span>
                            )}
                        </label>
                        <label className="block text-sm font-medium">
                            Request type
                            <select
                                className={inputClass}
                                value={form.data.request_type}
                                onChange={(event) =>
                                    form.setData(
                                        'request_type',
                                        event.target.value as RequestType,
                                    )
                                }
                            >
                                {requestTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block text-sm font-medium md:col-span-2">
                            Details (optional)
                            <textarea
                                className={inputClass}
                                rows={3}
                                maxLength={2000}
                                value={form.data.details}
                                onChange={(event) =>
                                    form.setData('details', event.target.value)
                                }
                                placeholder="Record only information needed to process the request."
                            />
                            {form.errors.details && (
                                <span className="text-sm text-destructive">
                                    {form.errors.details}
                                </span>
                            )}
                        </label>
                        <p className="text-xs text-muted-foreground md:col-span-2">
                            Do not enter passwords, authentication tokens, or
                            unnecessary sensitive information. Confirm applicable
                            privacy and retention policies before resolving requests.
                        </p>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                Record request
                            </button>
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Request register</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {requests.total} recorded requests.
                        </p>
                    </div>
                    <div className="divide-y">
                        {requests.data.map((item) => (
                            <article
                                key={item.id}
                                className="grid gap-4 p-4 md:grid-cols-2 md:p-5"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold capitalize">
                                            {item.request_type} request
                                        </h3>
                                        <span className="rounded-full bg-muted px-2 py-1 text-xs">
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Customer: {item.customer ?? 'Not linked'}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Submitted by {item.requested_by}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleString()
                                            : 'Time unavailable'}
                                    </p>
                                    {item.details && (
                                        <p className="mt-3 whitespace-pre-wrap text-sm">
                                            {item.details}
                                        </p>
                                    )}
                                    {item.resolution_note && (
                                        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                            Resolution: {item.resolution_note}
                                        </p>
                                    )}
                                    {item.resolved_at && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Resolved by {item.resolved_by ?? 'Former user'}
                                            {' · '}
                                            {new Date(item.resolved_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                {canResolve &&
                                    !['completed', 'rejected'].includes(item.status) && (
                                        <RequestResolutionForm
                                            item={item}
                                            workspaceId={workspace.id}
                                        />
                                    )}
                            </article>
                        ))}
                        {requests.data.length === 0 && (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                No privacy requests have been recorded.
                            </p>
                        )}
                    </div>
                    {requests.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {requests.links.map((link, index) => (
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
