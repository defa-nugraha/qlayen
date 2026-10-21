import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type WorkspaceOption = { id: number; name: string; role: string };

type CaptureLink = {
    id: number;
    name: string;
    source: 'qr' | 'nfc';
    is_active: boolean;
    url: string;
    created_at: string | null;
};

export default function CaptureIndex({
    links,
    workspaces,
    currentWorkspaceId,
}: {
    links: CaptureLink[];
    workspaces: WorkspaceOption[];
    currentWorkspaceId: number;
}) {
    const form = useForm<{
        name: string;
        source: 'qr' | 'nfc';
        workspace_id: number;
    }>({
        name: '',
        source: 'qr',
        workspace_id: currentWorkspaceId,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/capture-links', {
            onSuccess: () => form.reset('name'),
        });
    }

    function qrImage(url: string) {
        const endpoint =
            'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=';

        return endpoint + encodeURIComponent(url);
    }

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Capture links', href: '/capture-links' }]}
        >
            <Head title="QR & NFC Capture" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-5 sm:p-6 lg:p-8">
                <label className="block text-sm font-medium">
                    Active workspace
                    <select
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none sm:w-auto sm:min-w-56"
                        value={currentWorkspaceId}
                        onChange={(event) =>
                            router.get(
                                '/capture-links',
                                { workspace_id: Number(event.target.value) },
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
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        QR & NFC customer capture
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Create a public form link for customers to share their
                        contact details and consent. Use the link in an NFC tag
                        or print its QR code.
                    </p>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Create capture link
                    </h2>
                    <form
                        onSubmit={submit}
                        className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end"
                    >
                        <label className="block text-sm font-medium">
                            Campaign name
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                maxLength={120}
                                placeholder="e.g. Store counter October"
                                required
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className="block text-sm font-medium">
                            Use case
                            <select
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                value={form.data.source}
                                onChange={(event) =>
                                    form.setData(
                                        'source',
                                        event.target.value as 'qr' | 'nfc',
                                    )
                                }
                            >
                                <option value="qr">QR code</option>
                                <option value="nfc">NFC tag</option>
                            </select>
                        </label>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="min-h-11 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 md:w-auto"
                        >
                            {form.processing ? 'Creating…' : 'Create link'}
                        </button>
                    </form>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">
                        Your capture links
                    </h2>
                    {links.length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No capture links yet. Create one to start collecting
                            customer details.
                        </div>
                    )}
                    {links.map((link) => (
                        <article
                            key={link.id}
                            className="grid min-w-0 gap-4 rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md md:grid-cols-[200px_minmax(0,1fr)] md:p-5"
                        >
                            {link.source === 'qr' ? (
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-3">
                                    <img
                                        src={qrImage(link.url)}
                                        alt={'QR code for ' + link.name}
                                        width={180}
                                        height={180}
                                    />
                                    <span className="text-xs text-slate-600">
                                        Scan to open capture form
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center">
                                    <span
                                        className="text-3xl"
                                        aria-hidden="true"
                                    >
                                        📳
                                    </span>
                                    <span className="text-sm font-medium">
                                        NFC destination
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Write the URL below to an NFC tag.
                                    </span>
                                </div>
                            )}
                            <div className="flex min-w-0 flex-col items-start gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold">
                                        {link.name}
                                    </h3>
                                    <span className="rounded-full bg-muted px-2 py-1 text-xs uppercase">
                                        {link.source}
                                    </span>
                                    <span
                                        className={
                                            link.is_active
                                                ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800'
                                                : 'rounded-full bg-muted px-2 py-1 text-xs'
                                        }
                                    >
                                        {link.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <p className="text-sm break-all text-muted-foreground">
                                    {link.url}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                link.url,
                                            )
                                        }
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        Copy URL
                                    </button>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        Preview form
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.patch(
                                                '/capture-links/' +
                                                    link.id +
                                                    '/toggle',
                                                {
                                                    data: {
                                                        workspace_id:
                                                            currentWorkspaceId,
                                                    },
                                                },
                                            )
                                        }
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        {link.is_active
                                            ? 'Disable link'
                                            : 'Enable link'}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Anyone with this URL can open the form.
                                    Disable the link to stop further
                                    submissions.
                                </p>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </AppLayout>
    );
}
