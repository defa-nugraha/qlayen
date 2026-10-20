import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    MessageCircle,
    QrCode,
    ShieldCheck,
    Sparkles,
    Users,
    Workflow,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: QrCode,
        title: 'Tangkap prospek dengan QR & NFC',
        description:
            'Arahkan pelanggan ke formulir digital yang praktis untuk mengumpulkan informasi dan persetujuan mereka.',
    },
    {
        icon: Users,
        title: 'Data pelanggan lebih teratur',
        description:
            'Kelola kontak, sumber prospek, catatan interaksi, dan status pelanggan dalam workspace bisnis.',
    },
    {
        icon: Workflow,
        title: 'Tindak lanjut lebih terarah',
        description:
            'Catat jadwal dan catatan follow-up agar tim dapat menentukan langkah berikutnya dengan jelas.',
    },
];

const steps = [
    'Buat tautan capture untuk kampanye atau lokasi Anda.',
    'Bagikan melalui QR code atau tag NFC.',
    'Kelola data pelanggan dan rencanakan tindak lanjut.',
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head
                title="QLayen — Hubungkan interaksi menjadi relasi pelanggan"
                description="QLayen membantu bisnis mengumpulkan prospek melalui QR/NFC, mengelola data pelanggan, dan merencanakan tindak lanjut dari satu workspace."
            />
            <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
                <header className="relative z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                        <Link href="/" className="flex items-center gap-3" aria-label="QLayen beranda">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                                <Workflow className="size-5" aria-hidden="true" />
                            </span>
                            <span>
                                <span className="block text-lg font-bold tracking-tight">QLayen</span>
                                <span className="block text-xs text-slate-500">Customer relationship workspace</span>
                            </span>
                        </Link>
                        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Navigasi utama">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                >
                                    Buka dashboard <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:px-4"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        Mulai gunakan <ChevronRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative isolate">
                        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.13),_transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(14,165,233,0.09),_transparent_40%)]" />
                        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
                            <div className="max-w-2xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-2 text-sm font-medium text-indigo-700 shadow-sm">
                                    <Sparkles className="size-4" aria-hidden="true" />
                                    Dari interaksi pertama ke relasi pelanggan
                                </div>
                                <h1 className="text-4xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                    Jangan biarkan prospek berhenti di{' '}
                                    <span className="text-indigo-600">kontak pertama.</span>
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                                    QLayen membantu bisnis menangkap data pelanggan melalui QR/NFC,
                                    merapikan informasi, dan menjaga tindak lanjut tetap terorganisasi.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        {auth.user ? 'Buka workspace' : 'Buat akun QLayen'}
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                    <a
                                        href="#cara-kerja"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        Lihat cara kerja
                                    </a>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
                                    <span className="inline-flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                                        Workspace bisnis
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                                        QR & NFC capture
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                                        Pengelolaan follow-up
                                    </span>
                                </div>
                            </div>

                            <div className="relative mx-auto w-full max-w-xl">
                                <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-200/70 via-sky-100/60 to-white blur-2xl" />
                                <div className="relative rounded-[1.75rem] border border-white bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
                                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Alur pelanggan</p>
                                            <h2 className="mt-1 text-xl font-bold tracking-tight">Dari scan ke tindak lanjut</h2>
                                        </div>
                                        <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                            <QrCode className="size-6" aria-hidden="true" />
                                        </span>
                                    </div>
                                    <div className="space-y-3 py-5">
                                        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                                <QrCode className="size-5" aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold">QR / NFC</p>
                                                <p className="mt-1 text-sm text-slate-500">Pintu masuk ke formulir pelanggan</p>
                                            </div>
                                            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                                        </div>
                                        <div className="ml-6 h-4 border-l-2 border-dashed border-indigo-200" />
                                        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                                                <Users className="size-5" aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold">Data pelanggan</p>
                                                <p className="mt-1 text-sm text-slate-500">Kontak, sumber, dan persetujuan</p>
                                            </div>
                                            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                                        </div>
                                        <div className="ml-6 h-4 border-l-2 border-dashed border-indigo-200" />
                                        <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                                <MessageCircle className="size-5" aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold">Tindak lanjut</p>
                                                <p className="mt-1 text-sm text-slate-600">Jadwal dan catatan dalam satu alur</p>
                                            </div>
                                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700">Terorganisasi</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-4 text-white">
                                        <ShieldCheck className="size-5 shrink-0 text-emerald-300" aria-hidden="true" />
                                        <p className="text-sm leading-6 text-slate-200">
                                            Persetujuan pelanggan dicatat saat formulir capture dikirim.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                            <div className="max-w-2xl">
                                <p className="text-sm font-bold tracking-[0.18em] text-indigo-600 uppercase">Yang bisa Anda kelola</p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                    Fondasi yang rapi untuk hubungan pelanggan.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Mulai dari pengumpulan data sampai pengaturan tindak lanjut, tanpa harus menyebarkan catatan di banyak tempat.
                                </p>
                            </div>
                            <div className="mt-10 grid gap-5 md:grid-cols-3">
                                {features.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <article key={feature.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-900/5">
                                            <span className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                                <Icon className="size-6" aria-hidden="true" />
                                            </span>
                                            <h3 className="mt-5 text-lg font-bold text-slate-950">{feature.title}</h3>
                                            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section id="cara-kerja" className="py-16 sm:py-20">
                        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10">
                            <div>
                                <p className="text-sm font-bold tracking-[0.18em] text-indigo-600 uppercase">Cara kerja</p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                    Mulai sederhana. Kelola dengan lebih terarah.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Susun alur pengumpulan prospek yang sesuai dengan proses bisnis Anda, lalu kelola tindak lanjut dari workspace.
                                </p>
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                >
                                    {auth.user ? 'Lanjut ke dashboard' : 'Mulai sekarang'}
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            </div>
                            <ol className="space-y-4">
                                {steps.map((step, index) => (
                                    <li key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="pt-1">
                                            <p className="font-semibold text-slate-900">{step}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <p>© {new Date().getFullYear()} QLayen. Kelola relasi pelanggan dengan lebih terarah.</p>
                        <div className="flex items-center gap-4">
                            <Link href={login()} className="font-medium transition hover:text-indigo-600">Masuk</Link>
                            <Link href={register()} className="font-medium transition hover:text-indigo-600">Daftar</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
