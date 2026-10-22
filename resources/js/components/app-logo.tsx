import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const page = usePage();
    const { name } = page.props;
    const brandAssets =
        (
            page.props as typeof page.props & {
                brandAssets?: Record<string, { url: string; alt_text: string }>;
            }
        ).brandAssets ?? {};
    const sidebarLogo = brandAssets.app_sidebar;

    return sidebarLogo ? (
        <>
            <img
                src={sidebarLogo.url}
                alt={sidebarLogo.alt_text || String(name)}
                className="h-auto w-full max-w-[220px] min-w-0 object-contain group-data-[collapsible=icon]:hidden"
            />
            <AppLogoIcon className="hidden size-7 shrink-0 fill-current text-white group-data-[collapsible=icon]:block" />
        </>
    ) : (
        <div className="flex aspect-square size-11 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:size-8">
            <AppLogoIcon className="size-7 fill-current text-white group-data-[collapsible=icon]:size-5" />
        </div>
    );
}
