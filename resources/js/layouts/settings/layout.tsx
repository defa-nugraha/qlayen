import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Palette, ShieldCheck, UserRound } from 'lucide-react';

const settingsLinks = [
    { title: 'Profile', href: '/settings/profile', icon: UserRound, detail: 'Personal details' },
    { title: 'Security', href: '/settings/security', icon: ShieldCheck, detail: 'Password and access' },
    { title: 'Appearance', href: '/settings/appearance', icon: Palette, detail: 'Display preferences' },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const currentPath = usePage().url.split('?')[0];

    return (
        <div className="space-y-6">
            <header className="rounded-2xl border border-[#e1e9f5] bg-white p-5 shadow-[0_8px_30px_rgba(28,63,117,0.04)] md:p-7">
                <p className="text-[10px] font-extrabold tracking-[.16em] text-[#18a99f] uppercase">Personal workspace</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-[-.045em] text-[#10264d]">Account settings</h1>
                <p className="mt-2 text-sm leading-6 text-[#7586a0]">Manage your profile, sign-in security, and display preferences.</p>
            </header>
            <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
                <nav aria-label="Account settings" className="grid h-fit gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    {settingsLinks.map(({ title, href, icon: Icon, detail }) => {
                        const active = currentPath === href;
                        return (
                            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-2xl border p-3 no-underline transition ${active ? 'border-[#c8dcff] bg-[#edf4ff]' : 'border-[#e1e9f5] bg-white hover:border-[#c8dcff] hover:bg-[#fbfdff]'}`}>
                                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-white text-[#145df5]' : 'bg-[#f0f4fb] text-[#637594]'}`}><Icon size={18} /></span>
                                <span className="min-w-0"><span className={`block text-sm font-extrabold ${active ? 'text-[#145df5]' : 'text-[#263c5f]'}`}>{title}</span><span className="mt-1 block text-[11px] text-[#8494ae]">{detail}</span></span>
                            </Link>
                        );
                    })}
                </nav>
                <section className="min-w-0 rounded-2xl border border-[#e1e9f5] bg-white p-5 shadow-[0_8px_30px_rgba(28,63,117,0.04)] md:p-7">
                    {children}
                </section>
            </div>
        </div>
    );
}
