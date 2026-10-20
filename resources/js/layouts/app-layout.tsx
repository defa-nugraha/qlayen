import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Activity,
    BellRing,
    Building2,
    CalendarClock,
    ClipboardCheck,
    LayoutDashboard,
    LogOut,
    QrCode,
    Settings2,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const navigation = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', href: '/customers', icon: UsersRound },
    { label: 'Follow-ups', href: '/follow-ups', icon: CalendarClock },
    { label: 'QR & NFC links', href: '/capture-links', icon: QrCode },
    { label: 'Workspaces', href: '/workspaces', icon: Building2 },
];
const workspaceNavigation = [
    {
        label: 'Consent records',
        href: '/communication-consents',
        icon: ShieldCheck,
    },
    {
        label: 'Privacy requests',
        href: '/privacy-requests',
        icon: ClipboardCheck,
    },
    { label: 'Activity log', href: '/audit-logs', icon: Activity },
];
const mobileNavigation = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', href: '/customers', icon: UsersRound },
    { label: 'Follow-ups', href: '/follow-ups', icon: CalendarClock },
    { label: 'QR / NFC', href: '/capture-links', icon: QrCode },
    { label: 'More', href: '/workspaces', icon: Settings2 },
];

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const [moreOpen, setMoreOpen] = useState(false);
    const page = usePage();
    const currentPath = page.url.split('?')[0];
    const auth = page.props.auth;
    const userName = auth?.user?.name ?? 'Workspace member';
    const current = [...navigation, ...workspaceNavigation].find(
        (item) =>
            currentPath === item.href ||
            currentPath.startsWith(item.href + '/'),
    );
    const pageTitle =
        current?.label ?? breadcrumbs.at(-1)?.title ?? 'Workspace';
    const initials = userName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    const navLinks = (items: typeof navigation) =>
        items.map(({ label, href, icon: Icon }) => (
            <Link
                key={href}
                href={href}
                aria-current={currentPath === href ? 'page' : undefined}
            >
                <Icon size={18} strokeWidth={1.9} />
                <span>{label}</span>
            </Link>
        ));

    return (
        <div className="ql-app">
            <aside className="ql-sidebar">
                <Link
                    href="/dashboard"
                    className="ql-brand"
                    aria-label="QLayen dashboard"
                >
                    <img src="/qlayen-logo.svg" alt="QLayen" />
                </Link>
                <div className="ql-nav-label">Workspace</div>
                <nav className="ql-nav" aria-label="Workspace navigation">
                    {navLinks(navigation)}
                </nav>
                <div className="ql-nav-label">Trust & governance</div>
                <nav className="ql-nav" aria-label="Governance navigation">
                    {navLinks(workspaceNavigation)}
                </nav>
                <div className="ql-sidebar-bottom">
                    <div className="ql-user-chip">
                        <div className="ql-avatar">{initials || 'QL'}</div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#10264d]">
                                {userName}
                            </p>
                            <p className="mt-1 text-[10px] text-[#8494ae]">
                                QLayen workspace
                            </p>
                        </div>
                        <BellRing size={15} className="text-[#8494ae]" />
                    </div>
                    <Link
                        href="/settings/profile"
                        className="mt-3 flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold text-[#637594] no-underline hover:bg-[#edf4ff] hover:text-[#145df5]"
                    >
                        <Settings2 size={16} /> Account settings
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-semibold text-[#637594] hover:bg-[#fff1f2] hover:text-[#d92d48]"
                    >
                        <LogOut size={16} /> Sign out
                    </Link>
                </div>
            </aside>
            <div className="ql-main">
                <header className="ql-topbar">
                    <div>
                        <p className="ql-topbar-eyebrow">QLayen / Workspace</p>
                        <p className="mt-1 text-sm font-extrabold tracking-tight text-[#10264d]">
                            {pageTitle}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-xs font-bold text-[#10264d]">
                                {userName}
                            </p>
                            <p className="mt-1 text-[10px] text-[#8494ae]">
                                Customer engagement
                            </p>
                        </div>
                        <div className="ql-avatar">{initials || 'QL'}</div>
                    </div>
                </header>
                <main className="ql-page-content">{children}</main>
            </div>
            <nav className="ql-mobile-nav" aria-label="Mobile navigation">
                {mobileNavigation.map(({ label, href, icon: Icon }) =>
                    label === 'More' ? (
                        <button
                            key={href}
                            type="button"
                            aria-expanded={moreOpen}
                            aria-controls="ql-mobile-more-menu"
                            onClick={() => setMoreOpen((open) => !open)}
                            className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-0.5 py-1.5 text-[9px] font-bold ${moreOpen ? 'bg-[#edf4ff] text-[#145df5]' : 'text-[#7788a4]'}`}
                        >
                            <Icon size={19} strokeWidth={1.9} />
                            <span>More</span>
                        </button>
                    ) : (
                        <Link
                            key={href}
                            href={href}
                            aria-current={
                                currentPath === href ? 'page' : undefined
                            }
                        >
                            <Icon size={19} strokeWidth={1.9} />
                            <span>{label}</span>
                        </Link>
                    ),
                )}
            </nav>
            {moreOpen && (
                <div
                    id="ql-mobile-more-menu"
                    className="fixed right-3 bottom-[82px] z-[60] grid w-[min(320px,calc(100vw-24px))] gap-1 rounded-2xl border border-[#e1e9f5] bg-white p-3 shadow-2xl sm:hidden"
                >
                    {[
                        ...workspaceNavigation,
                        {
                            label: 'Account settings',
                            href: '/settings/profile',
                            icon: Settings2,
                        },
                    ].map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMoreOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#536786] no-underline hover:bg-[#edf4ff] hover:text-[#145df5]"
                        >
                            <Icon size={17} />
                            {label}
                        </Link>
                    ))}
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#d92d48] hover:bg-[#fff1f2]"
                    >
                        <LogOut size={17} />
                        Sign out
                    </Link>
                </div>
            )}
        </div>
    );
}
