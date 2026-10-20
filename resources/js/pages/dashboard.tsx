import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    QrCode,
    Users,
    Building2,
    Send,
} from 'lucide-react';
import { dashboard } from '@/routes';

const shortcuts = [
    {
        href: '/customers',
        icon: Users,
        eyebrow: 'CRM',
        title: 'Pelanggan',
        description:
            'Kelola kontak, sumber prospek, catatan, dan status pelanggan.',
        action: 'Buka daftar pelanggan',
        iconClass: 'bg-indigo-50 text-indigo-700',
    },
    {
        href: '/follow-ups',
        icon: CalendarClock,
        eyebrow: 'Relasi',
        title: 'Follow-up',
        description:
            'Lihat jadwal tindak lanjut dan catatan yang perlu diperhatikan.',
        action: 'Lihat jadwal',
        iconClass: 'bg-amber-50 text-amber-700',
    },
    {
        href: '/capture-links',
        icon: QrCode,
        eyebrow: 'Akuisisi',
        title: 'QR & NFC capture',
        description:
            'Buat tautan formulir untuk mengumpulkan prospek secara langsung.',
        action: 'Kelola tautan',
        iconClass: 'bg-sky-50 text-sky-700',
    },
    {
        href: '/workspaces',
        icon: Building2,
        eyebrow: 'Tim',
        title: 'Workspace bisnis',
        description: 'Atur ruang kerja bisnis dan kelola keanggotaan tim.',
        action: 'Kelola workspace',
        iconClass: 'bg-emerald-50 text-emerald-700',
    },
];

const setupSteps = [
    {
        title: 'Buat workspace bisnis',
        description: 'Siapkan ruang kerja untuk memisahkan data tiap bisnis.',
        href: '/workspaces',
        action: 'Buka workspace',
    },
    {
        title: 'Tambahkan pelanggan atau buat tautan capture',
        description:
            'Mulai dengan data yang sudah dimiliki atau kumpulkan prospek baru melalui QR/NFC.',
        href: '/capture-links',
        action: 'Siapkan capture',
    },
    {
        title: 'Susun jadwal tindak lanjut',
        description:
            'Tambahkan tanggal dan catatan follow-up pada pelanggan yang perlu dihubungi.',
        href: '/follow-ups',
        action: 'Lihat follow-up',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-full bg-slate-50/70">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:gap-10 lg:p-8">
                    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9 lg:px-10">
                        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-indigo-500/30 blur-3xl" />
                        <div className="pointer-events-none absolute right-1/3 -bottom-32 size-64 rounded-full bg-sky-500/20 blur-3xl" />
                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                                    <Send
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    Customer relationship workspace
                                </span>
                                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Selamat datang di QLayen
                                </h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                                    Kelola data pelanggan, kumpulkan prospek
                                    lewat QR/NFC, dan susun tindak lanjut dari
                                    satu tempat.
                                </p>
                            </div>
                            <Link
                                href="/customers"
                                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                            >
                                Buka CRM{' '}
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                        <div className="relative mt-8 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                                    <Users
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Data pelanggan
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Kontak dan catatan terpusat
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-sky-200">
                                    <QrCode
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">
                                        QR & NFC
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Formulir capture yang praktis
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-emerald-200">
                                    <CalendarClock
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Tindak lanjut
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Jadwal dan catatan follow-up
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-600">
                                    Navigasi utama
                                </p>
                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                                    Apa yang ingin Anda kelola?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Pilih area kerja untuk melanjutkan aktivitas
                                    bisnis Anda.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {shortcuts.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-6"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span
                                                className={`flex size-12 items-center justify-center rounded-2xl ${item.iconClass}`}
                                            >
                                                <Icon
                                                    className="size-6"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                                {item.eyebrow}
                                            </span>
                                        </div>
                                        <h3 className="mt-5 text-lg font-bold text-slate-950">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                                            {item.description}
                                        </p>
                                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                                            {item.action}
                                            <ArrowRight
                                                className="size-4 transition-transform group-hover:translate-x-1"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Langkah awal yang disarankan
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        Gunakan alur ini untuk menyiapkan
                                        workspace sebelum mengelola prospek.
                                    </p>
                                </div>
                                <span className="hidden size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 sm:flex">
                                    <CheckCircle2
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </div>
                            <ol className="mt-6 space-y-5">
                                {setupSteps.map((step, index) => (
                                    <li key={step.title} className="flex gap-4">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-slate-900">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {step.description}
                                            </p>
                                            <Link
                                                href={step.href}
                                                className="mt-2 inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                                            >
                                                {step.action}{' '}
                                                <ChevronRight
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <aside className="flex flex-col rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-7">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-white text-indigo-700 shadow-sm">
                                <CircleHelp
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <h2 className="mt-5 text-lg font-bold text-slate-950">
                                Butuh mulai dari mana?
                            </h2>
                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                                Jika baru menggunakan QLayen, siapkan workspace
                                terlebih dahulu. Setelah itu, tambahkan
                                pelanggan atau buat tautan capture untuk mulai
                                mengumpulkan data.
                            </p>
                            <Link
                                href="/workspaces"
                                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                Siapkan workspace{' '}
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Link>
                            <div className="mt-5 flex items-center gap-2 border-t border-indigo-100 pt-4 text-xs leading-5 text-slate-500">
                                <ShieldCheckIcon />
                                Data dikelola dalam konteks workspace yang Anda
                                akses.
                            </div>
                        </aside>
                    </section>
                </div>
            </div>
        </>
    );
}

function ShieldCheckIcon() {
    return (
        <CheckCircle2
            className="size-4 shrink-0 text-emerald-600"
            aria-hidden="true"
        />
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
