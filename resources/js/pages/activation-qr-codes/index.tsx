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
                        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
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
                        <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium">
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
                        <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium">
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
                                className="activation-qr-print relative isolate mx-auto flex w-full max-w-[105mm] flex-col overflow-hidden rounded-[22px] border border-cyan-200 bg-white text-slate-950 shadow-lg"
                                style={{
                                    backgroundColor: code.background_color,
                                    color: code.foreground_color,
                                }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[22px]"
                                >
                                    <div
                                        className="absolute -left-16 -top-14 size-48 rounded-full bg-blue-600"
                                    />
                                    <div
                                        className="absolute -right-20 -top-16 size-56 rounded-full bg-cyan-400"
                                    />
                                    <div
                                        className="absolute -bottom-16 -left-16 size-52 rounded-full bg-blue-700"
                                    />
                                    <div
                                        className="absolute -bottom-20 -right-16 size-56 rounded-full bg-cyan-400"
                                    />
                                    <div
                                        className="absolute inset-[10px] rounded-[18px] bg-white"
                                    />
                                    <div
                                        className="absolute inset-x-0 top-0 h-[30%] rounded-b-[48%] bg-gradient-to-br from-white via-white to-blue-50"
                                    />
                                </div>

                                <div className="relative px-5 pb-2 pt-5 text-center">
                                    <div className="mx-auto flex min-h-12 items-center justify-center">
                                        <img
                                            src="/storage/settings/logo.png"
                                            alt="QLayen"
                                            className="max-h-12 max-w-[65%] object-contain"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    'none';
                                            }}
                                        />
                                        <span className="text-3xl font-black tracking-tight text-slate-950">
                                            QLayen
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[10px] font-semibold tracking-[0.22em] text-slate-900">
                                        SCAN{' '}
                                        <span className="text-cyan-500">•</span>{' '}
                                        SAMBUNG{' '}
                                        <span className="text-cyan-500">•</span>{' '}
                                        TERHUBUNG
                                    </p>
                                </div>

                                <div
                                        className="relative mx-auto mt-3 w-[78%] rounded-[24px] border-[3px] border-cyan-400 bg-white p-2 shadow-[0_8px_24px_rgba(14,165,233,0.18)]"
                                    >
                                    <img
                                        src={qrImage(code)}
                                        alt={'Activation QR for ' + code.name}
                                        width={360}
                                        height={360}
                                        className="block aspect-square w-full object-contain"
                                    />
                                    <div
                                        className="absolute left-1/2 top-1/2 flex size-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-white bg-[#25D366] shadow-md"
                                    >
                                        <svg
                                            viewBox="0 0 32 32"
                                            role="img"
                                            aria-label="WhatsApp"
                                            className="size-[82%] fill-white"
                                        >
                                            <path
                                                d="M16.02 3.2A12.65 12.65 0 0 0 5.18 22.36L3.5 28.5l6.3-1.65A12.65 12.65 0 1 0 16.02 3.2Zm0 22.95c-1.95 0-3.86-.52-5.53-1.51l-.4-.24-3.74.98 1-3.64-.26-.42a10.12 10.12 0 1 1 8.93 4.83Zm5.56-7.58c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.07-.8.37-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div
                                        className="relative mx-4 mt-3 rounded-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-4 py-3 text-center text-white shadow-md"
                                    >
                                    <p className="text-xl font-black tracking-tight">
                                        SCAN DI SINI
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-snug text-blue-50">
                                        Terhubung langsung dengan kami
                                    </p>
                                    <p className="text-[11px] leading-snug text-blue-50">
                                        melalui WhatsApp
                                    </p>
                                </div>

                                <div
                                    className="relative mx-3 mb-3 mt-3 grid grid-cols-3 gap-1 rounded-[20px] bg-white/95 px-2 py-3 text-center"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-sky-100 text-blue-600">
                                            <QrCode className="size-7" />
                                        </div>
                                        <p className="mt-2 text-[10px] font-extrabold text-blue-950">
                                            1. Scan QR
                                        </p>
                                        <p className="mt-1 text-[9px] leading-tight text-blue-950">
                                            Arahkan kamera
                                            <br />
                                            ke QR Code
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-[#25D366]">
                                            <svg
                                                viewBox="0 0 32 32"
                                                aria-label="WhatsApp"
                                                role="img"
                                                className="size-8 fill-current"
                                            >
                                                <path
                                                d="M16.02 3.2A12.65 12.65 0 0 0 5.18 22.36L3.5 28.5l6.3-1.65A12.65 12.65 0 1 0 16.02 3.2Zm0 22.95c-1.95 0-3.86-.52-5.53-1.51l-.4-.24-3.74.98 1-3.64-.26-.42a10.12 10.12 0 1 1 8.93 4.83Zm5.56-7.58c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.07-.8.37-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"
                                            />
                                            </svg>
                                        </div>
                                        <p className="mt-2 text-[10px] font-extrabold text-blue-950">
                                            2. WhatsApp
                                        </p>
                                        <p className="mt-1 text-[9px] leading-tight text-blue-950">
                                            Ikuti tautan
                                            <br />
                                            yang terbuka
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="size-7"
                                            >
                                                <circle cx="12" cy="7" r="4" />
                                                <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                                            </svg>
                                        </div>
                                        <p className="mt-2 text-[10px] font-extrabold text-blue-950">
                                            3. Kenali kami
                                        </p>
                                        <p className="mt-1 text-[9px] leading-tight text-blue-950">
                                            Info, promo,
                                            <br />
                                            dan layanan
                                        </p>
                                    </div>
                                </div>
                                <p className="relative mb-3 text-center text-[8px] font-medium tracking-wide text-slate-500">
                                    {code.frame_text}
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
