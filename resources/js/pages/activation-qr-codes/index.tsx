import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Printer, QrCode } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

type WorkspaceOption = { id: number; name: string; role: string };
type ActivationCode = {
    id: number;
    name: string;
    token: string;
    url: string;
    foreground_color: string;
    background_color: string;
    frame_text: string;
    status: 'pending' | 'active' | 'disabled';
    activated_at: string | null;
    business_name: string | null;
};

export default function ActivationQrIndex({
    codes,
    workspaces,
    currentWorkspaceId,
}: {
    codes: ActivationCode[];
    workspaces: WorkspaceOption[];
    currentWorkspaceId: number;
}) {
    const form = useForm({
        name: '',
        foreground_color: '#111827',
        background_color: '#FFFFFF',
        frame_text: 'SCAN TO ACTIVATE',
        workspace_id: currentWorkspaceId,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/activation-qr-codes', {
            onSuccess: () => form.reset('name'),
        });
    }

    function qrImage(code: ActivationCode) {
        const params = new URLSearchParams({
            size: '240x240',
            data: code.url,
            color: code.foreground_color.replace('#', ''),
            bgcolor: code.background_color.replace('#', ''),
            format: 'png',
        });
        return (
            'https://api.qrserver.com/v1/create-qr-code/?' + params.toString()
        );
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Activation QR', href: '/activation-qr-codes' },
            ]}
        >
            <Head title="Activation QR codes" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <QrCode className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Business activation QR
                        </h1>
                        <p
                            className="mt-1 max-w-3xl text-sm text-muted-foreground"
                        >
                            Generate a branded QR card for a new business owner.
                            Scanning it opens registration; after activation,
                            the same QR collects customer details for that
                            business.
                        </p>
                    </div>
                </div>

                <label className="block text-sm font-medium">
                    Workspace
                    <select
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 sm:w-auto sm:min-w-56"
                        value={currentWorkspaceId}
                        onChange={(event) =>
                            router.get(
                                '/activation-qr-codes',
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

                <section className="rounded-xl border bg-card p-4 md:p-5">
                    <h2 className="mb-4 text-lg font-semibold">
                        Create activation QR
                    </h2>
                    <form
                        onSubmit={submit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <label className="text-sm font-medium">
                            QR label
                            <input
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                maxLength={120}
                                required
                                placeholder="e.g. New merchant starter kit"
                            />
                            {form.errors.name && (
                                <span className="text-sm text-destructive">
                                    {form.errors.name}
                                </span>
                            )}
                        </label>
                        <label className="text-sm font-medium">
                            Frame text
                            <input
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                                value={form.data.frame_text}
                                onChange={(event) =>
                                    form.setData(
                                        'frame_text',
                                        event.target.value,
                                    )
                                }
                                maxLength={80}
                                required
                            />
                            {form.errors.frame_text && (
                                <span className="text-sm text-destructive">
                                    {form.errors.frame_text}
                                </span>
                            )}
                        </label>
                        <label
                            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium"
                        >
                            QR foreground
                            <input
                                aria-label="QR foreground color"
                                type="color"
                                className="size-10 cursor-pointer rounded border-0 bg-transparent"
                                value={form.data.foreground_color}
                                onChange={(event) =>
                                    form.setData(
                                        'foreground_color',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                        <label
                            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium"
                        >
                            Card and QR background
                            <input
                                aria-label="Background color"
                                type="color"
                                className="size-10 cursor-pointer rounded border-0 bg-transparent"
                                value={form.data.background_color}
                                onChange={(event) =>
                                    form.setData(
                                        'background_color',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 md:col-span-2"
                        >
                            {form.processing
                                ? 'Generating…'
                                : 'Generate activation QR'}
                        </button>
                    </form>
                    <p className="mt-3 text-xs text-muted-foreground">
                        The QR stays pending until a business owner completes
                        registration. Use high contrast for reliable scanning.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {codes.length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                            No activation QR codes yet. Generate one to begin.
                        </div>
                    )}
                    {codes.map((code) => (
                        <article
                            key={code.id}
                            className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                        >
                            <div
                                className="activation-qr-print p-5"
                                style={{
                                    backgroundColor: code.background_color,
                                    color: code.foreground_color,
                                }}
                            >
                                <div className="mb-3 text-center text-xs font-bold tracking-[0.18em] uppercase">
                                    {code.frame_text}
                                </div>
                                <div
                                    className="mx-auto w-fit rounded-xl p-2"
                                    style={{
                                        backgroundColor: code.background_color,
                                    }}
                                >
                                    <img
                                        src={qrImage(code)}
                                        alt={'Activation QR for ' + code.name}
                                        width={220}
                                        height={220}
                                        className="block size-52 max-w-full"
                                    />
                                </div>
                                <h3 className="mt-3 text-center text-lg font-bold">
                                    {code.name}
                                </h3>
                                <p className="mt-1 text-center text-xs">
                                    Scan to register your business
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 p-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={
                                            'rounded-full px-2 py-1 text-xs font-medium ' +
                                            (code.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : code.status === 'disabled'
                                                  ? 'bg-muted text-muted-foreground'
                                                  : 'bg-amber-100 text-amber-800')
                                        }
                                    >
                                        {code.status === 'active'
                                            ? 'Activated'
                                            : code.status === 'disabled'
                                              ? 'Disabled'
                                              : 'Pending activation'}
                                    </span>
                                    {code.business_name && (
                                        <span className="text-xs text-muted-foreground">
                                            {code.business_name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs break-all text-muted-foreground">
                                    {code.url}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                                    >
                                        <Printer className="size-4" /> Print QR
                                        card
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                code.url,
                                            )
                                        }
                                        className="min-h-10 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                                    >
                                        Copy URL
                                    </button>
                                    {code.status !== 'active' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.patch(
                                                    '/activation-qr-codes/' +
                                                        code.id +
                                                        '/toggle',
                                                    {
                                                        workspace_id:
                                                            currentWorkspaceId,
                                                    },
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className="min-h-10 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                                        >
                                            {code.status === 'disabled'
                                                ? 'Enable'
                                                : 'Disable'}
                                        </button>
                                    )}
                                </div>
                                {code.activated_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Activated{' '}
                                        {new Date(
                                            code.activated_at,
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </section>
            </div>
            <style>
                {`
                    @page { size: A6 portrait; margin: 0; }
                    @media print {
                        body * { visibility: hidden !important; }
                        .activation-qr-print,
                        .activation-qr-print * {
                            visibility: visible !important;
                        }
                        .activation-qr-print {
                            position: fixed !important;
                            inset: 0 auto auto 0 !important;
                            width: 105mm !important;
                            height: 148mm !important;
                            max-width: none !important;
                            margin: 0 !important;
                            border-radius: 0 !important;
                            box-shadow: none !important;
                            print-color-adjust: exact !important;
                            -webkit-print-color-adjust: exact !important;
                            overflow: hidden !important;
                        }
                    }
                `}
            </style>
        </AppLayout>
    );
}
