import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const page = usePage();
    const { name } = page.props;
    const brandAssets = (page.props as typeof page.props & { brandAssets?: Record<string, { url: string; alt_text: string }> }).brandAssets ?? {};
    const sidebarLogo = brandAssets.app_sidebar;

    return (
        <>
            {sidebarLogo ? (
                <img src={sidebarLogo.url} alt={sidebarLogo.alt_text || String(name)} className="size-8 shrink-0 rounded-md object-contain" />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
