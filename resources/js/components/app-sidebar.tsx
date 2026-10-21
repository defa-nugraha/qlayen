import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    CalendarClock,
    FolderGit2,
    Image,
    LayoutGrid,
    MessageCircle,
    QrCode,
    Settings2,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Workspaces', href: '/workspaces', icon: Building2 },
    { title: 'Customers', href: '/customers', icon: UsersRound },
    { title: 'Follow-ups', href: '/follow-ups', icon: CalendarClock },
    {
        title: 'WhatsApp Gateway',
        href: '/whatsapp/settings',
        icon: MessageCircle,
    },
    {
        title: 'WhatsApp Campaigns',
        href: '/whatsapp/campaigns',
        icon: MessageCircle,
    },
    { title: 'QR & NFC Capture', href: '/capture-links', icon: QrCode },
    { title: 'Activation QR', href: '/activation-qr-codes', icon: QrCode },
    { title: 'Kelola Logo', href: '/brand-assets', icon: Image },
    {
        title: 'Mode Capture (Admin)',
        href: '/admin/whatsapp-capture-mode',
        icon: Settings2,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="md:py-2 md:pl-2 [&_[data-sidebar=sidebar]]:border-slate-200 [&_[data-sidebar=sidebar]]:bg-white [&_[data-sidebar=sidebar]]:text-slate-900"
        >
            <SidebarHeader className="border-b border-slate-200/80 px-3 pt-3 pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-12 rounded-xl px-3 hover:bg-sidebar-accent/70"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="gap-0">
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter className="border-t border-slate-200/80 px-2 pt-3 pb-3">
                <NavFooter
                    items={footerNavItems}
                    className="mt-auto px-1 py-1"
                />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
