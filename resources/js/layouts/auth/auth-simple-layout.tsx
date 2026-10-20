import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main className="ql-auth">
            <section className="ql-auth-story">
                <Link href="/" className="relative z-10 inline-flex w-fit rounded-2xl bg-white px-4 py-3" aria-label="Back to QLayen home">
                    <img src="/qlayen-logo.svg" alt="QLayen" className="w-36" />
                </Link>
                <div className="relative z-10 max-w-xl py-10">
                    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100">
                        <span className="size-2 rounded-full bg-[#35e0c5]" /> Customer relationships, connected
                    </p>
                    <h2 className="max-w-lg text-4xl leading-tight font-extrabold tracking-[-0.05em] text-white md:text-5xl">
                        Make every customer connection <span className="text-[#55e4d4]">count.</span>
                    </h2>
                    <p className="ql-auth-longcopy mt-6 max-w-md text-sm leading-7 text-blue-100/80">
                        Bring customer profiles, QR and NFC touchpoints, interaction history, and thoughtful follow-ups into one calm workspace.
                    </p>
                    <div className="ql-auth-longcopy mt-10 grid max-w-md grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-2xl font-extrabold text-white">01</p>
                            <p className="mt-2 text-xs text-blue-100/80">Know your audience</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-2xl font-extrabold text-white">02</p>
                            <p className="mt-2 text-xs text-blue-100/80">Follow up with purpose</p>
                        </div>
                    </div>
                </div>
                <p className="relative z-10 text-xs text-blue-100/65">© {new Date().getFullYear()} QLayen · Customer engagement workspace</p>
            </section>
            <section className="ql-auth-panel">
                <div className="ql-auth-card">
                    <div className="mb-8">
                        <p className="mb-3 text-xs font-extrabold tracking-[.16em] text-[#18a99f] uppercase">Welcome to QLayen</p>
                        <h1 className="text-3xl font-extrabold tracking-[-.045em] text-[#10264d]">{title}</h1>
                        <p className="mt-3 text-sm leading-6 text-[#7586a0]">{description}</p>
                    </div>
                    {children}
                    <p className="mt-8 text-center text-xs leading-5 text-[#8b9bb5]">By continuing, you agree to use customer information responsibly and respect communication preferences.</p>
                </div>
            </section>
        </main>
    );
}
