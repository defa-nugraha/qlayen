import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type InteractionType = 'note' | 'call' | 'message' | 'purchase' | 'other';

type Interaction = {
    id: number;
    type: InteractionType;
    summary: string;
    details: string | null;
    occurred_at: string;
    user: { id: number; name: string } | null;
};

type PageProps = {
    customer: {
        id: number;
        name: string;
        phone: string | null;
        email: string | null;
    };
    workspaceId: number;
    interactions: {
        data: Interaction[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
};

type InteractionForm = {
    workspace_id: number;
    type: InteractionType;
    summary: string;
    details: string;
    occurred_at: string;
};

function currentLocalDateTime() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0, 16);
}

const inputClass =
    'mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const labelClass = 'block text-sm font-medium text-foreground';

export default function CustomerInteractionsIndex({
    customer,
    workspaceId,
    interactions,
}: PageProps) {
    const form = useForm<InteractionForm>({
        workspace_id: workspaceId,
        type: 'note',
        summary: '',
        details: '',
        occurred_at: currentLocalDateTime(),
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/customers/' + customer.id + '/interactions', {
            onSuccess: () => {
                form.setData({
                    workspace_id: workspaceId,
                    type: 'note',
                    summary: '',
                    details: '',
                    occurred_at: currentLocalDateTime(),
                });
                form.clearErrors();
            },
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Customers', href: '/customers' },
                {
                    title: customer.name,
                    href:
                        '/customers/' +
                        customer.id +
                        '/interactions?workspace_id=' +
                        workspaceId,
                },
                {
                    title: 'Interaction history',
                    href:
                        '/customers/' +
                        customer.id +
                        '/interactions?workspace_id=' +
                        workspaceId,
                },
            ]}
        >
            <Head title={'Interaction history — ' + customer.name} />
            <div className="flex flex-col gap-6 p-4 md:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <button
                            type="button"
                            onClick={() =>
                                router.get('/customers', {
                                    workspace_id: workspaceId,
                                })
                            }
                            className="mb-2 text-sm text-primary hover:underline"
                        >
                            ← Back to customers
                        </button>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Interaction history
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {customer.name}
                            {customer.phone ? ' · ' + customer.phone : ''}
                            {customer.email ? ' · ' + customer.email : ''}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                            Recorded interactions
                        </p>
                        <p className="text-2xl font-semibold">
                            {interactions.total}
                        </p>
                    </div>
                </div>

                <section className="rounded-xl border bg-card p-4 md:p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        Record interaction
                    </h2>
                    <form
                        onSubmit={submit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <label className={labelClass}>
                            Interaction type *
                            <select
                                className={inputClass}
                                value={form.data.type}
                                onChange={(event) =>
                                    form.setData(
                                        'type',
                                        event.target.value as InteractionType,
                                    )
                                }
                                required
                            >
                                <option value="note">Note</option>
                                <option value="call">Phone call</option>
                                <option value="message">Message</option>
                                <option value="purchase">Purchase</option>
                                <option value="other">Other</option>
                            </select>
                            {form.errors.type && (
                                <span className="text-sm text-destructive">
                                    {form.errors.type}
                                </span>
                            )}
                        </label>
                        <label className={labelClass}>
                            Date and time *
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={form.data.occurred_at}
                                onChange={(event) =>
                                    form.setData(
                                        'occurred_at',
                                        event.target.value,
                                    )
                                }
                                required
                            />
                            {form.errors.occurred_at && (
                                <span className="text-sm text-destructive">
                                    {form.errors.occurred_at}
                                </span>
                            )}
                        </label>
                        <label className={labelClass + ' md:col-span-2'}>
                            Summary *
                            <input
                                className={inputClass}
                                value={form.data.summary}
                                onChange={(event) =>
                                    form.setData('summary', event.target.value)
                                }
                                maxLength={255}
                                required
                                placeholder="e.g. Asked about the new product package"
                            />
                            {form.errors.summary && (
                                <span className="text-sm text-destructive">
                                    {form.errors.summary}
                                </span>
                            )}
                        </label>
                        <label className={labelClass + ' md:col-span-2'}>
                            Details (optional)
                            <textarea
                                className={inputClass}
                                rows={4}
                                value={form.data.details}
                                onChange={(event) =>
                                    form.setData('details', event.target.value)
                                }
                                maxLength={5000}
                                placeholder="Record the context, outcome, or next step."
                            />
                            {form.errors.details && (
                                <span className="text-sm text-destructive">
                                    {form.errors.details}
                                </span>
                            )}
                        </label>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Saving…'
                                    : 'Save interaction'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Timeline</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Newest interactions appear first. Records are
                            append-only in this MVP.
                        </p>
                    </div>
                    <div className="divide-y">
                        {interactions.data.map((interaction) => (
                            <article
                                key={interaction.id}
                                className="flex gap-3 p-4 md:p-5"
                            >
                                <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                                    {interaction.type.slice(0, 1)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {interaction.summary}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground capitalize">
                                                {interaction.type} ·{' '}
                                                {interaction.user?.name ??
                                                    'Former user'}
                                            </p>
                                        </div>
                                        <time
                                            dateTime={interaction.occurred_at}
                                            className="text-xs text-muted-foreground"
                                        >
                                            {new Date(
                                                interaction.occurred_at,
                                            ).toLocaleString()}
                                        </time>
                                    </div>
                                    {interaction.details && (
                                        <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">
                                            {interaction.details}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                        {interactions.data.length === 0 && (
                            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                                No interactions recorded yet. Add the first
                                interaction above.
                            </p>
                        )}
                    </div>
                    {interactions.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {interactions.links.map((link, index) => (
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
