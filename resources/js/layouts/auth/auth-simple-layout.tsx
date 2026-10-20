import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, QrCode, Users, Workflow } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const page = usePage();
    const brandAssets =
        (
            page.props as typeof page.props & {
                brandAssets?: Record<string, { url: string; alt_text: string }>;
            }
        ).brandAssets ?? {};
    const authLogo = brandAssets.auth;

    return (
        <main className="min-h-svh bg-slate-50 text-slate-900 lg:grid lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-14">
                <div className="pointer-events-none absolute top-10 -right-24 size-96 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-sky-500/20 blur-3xl" />
                <Link
                    href={home()}
                    className="relative inline-flex w-fit items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                    {authLogo ? (
                        <img
                            src={authLogo.url}
                            alt={authLogo.alt_text || 'QLayen'}
                            className="max-h-11 max-w-40 object-contain"
                        />
                    ) : (
                        <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/30">
                            <Workflow className="size-6" aria-hidden="true" />
                        </span>
                    )}
                    <span>
                        <span className="block text-lg font-bold tracking-tight">
                            QLayen
                        </span>
                        <span className="block text-xs text-slate-400">
                            Customer relationship workspace
                        </span>
                    </span>
                </Link>

                <div className="relative my-12 max-w-xl">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-indigo-100">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Hubungkan setiap interaksi
                    </p>
                    <h2 className="mt-6 text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
                        Relasi pelanggan dimulai dari pengalaman yang lebih
                        teratur.
                    </h2>
                    <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                        Simpan informasi pelanggan, kumpulkan prospek melalui
                        QR/NFC, dan rencanakan tindak lanjut dalam satu
                        workspace.
                    </p>
                    <div className="mt-10 space-y-4">
                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-indigo-200">
                                <QrCode className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold">
                                    QR & NFC capture
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    Permudah pengumpulan prospek dan
                                    persetujuan.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-sky-200">
                                <Users className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold">
                                    Workspace pelanggan
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    Jaga kontak dan tindak lanjut tetap
                                    terorganisasi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="relative text-xs text-slate-500">
                    © {new Date().getFullYear()} QLayen · Customer relationship
                    workspace
                </p>
            </section>

            <section className="flex min-h-svh flex-col justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
                <div className="mx-auto w-full max-w-md">
                    <Link
                        href={home()}
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none lg:hidden"
                    >
                        {authLogo ? (
                            <img
                                src={authLogo.url}
                                alt={authLogo.alt_text || 'QLayen'}
                                className="max-h-9 max-w-28 object-contain"
                            />
                        ) : (
                            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                <Workflow
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                        )}
                        <span className="text-base font-bold text-slate-950">
                            QLayen
                        </span>
                    </Link>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
                        <div className="mb-7 space-y-2">
                            <p className="text-xs font-bold tracking-[0.18em] text-indigo-600 uppercase">
                                Akun QLayen
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                {title}
                            </h1>
                            <p className="text-sm leading-6 text-slate-600">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>

                    <Link
                        href={home()}
                        className="mx-auto mt-6 inline-flex min-h-10 items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Kembali ke halaman utama
                    </Link>
                </div>
            </section>
        </main>
    );
}
