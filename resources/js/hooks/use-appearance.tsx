import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light';
export type Appearance = 'light';
export type UseAppearanceReturn = { readonly appearance: Appearance; readonly resolvedAppearance: ResolvedAppearance; readonly updateAppearance: (mode: Appearance) => void; };
const listeners = new Set<() => void>();
const subscribe = (callback: () => void) => { listeners.add(callback); return () => listeners.delete(callback); };
const notify = () => listeners.forEach((listener) => listener());
const setCookie = (name: string, value: string, days = 365) => { if (typeof document === 'undefined') return; document.cookie = `${name}=${value};path=/;max-age=${days * 86400};SameSite=Lax`; };
export function initializeTheme(): void {
 if (typeof window === 'undefined') return;
 localStorage.setItem('appearance', 'light');
 setCookie('appearance', 'light');
 document.documentElement.classList.remove('dark');
 document.documentElement.style.colorScheme = 'light';
}
export function useAppearance(): UseAppearanceReturn {
 const appearance = useSyncExternalStore(subscribe, () => 'light' as const, () => 'light' as const);
 const updateAppearance = (_mode: Appearance): void => {
  localStorage.setItem('appearance', 'light'); setCookie('appearance', 'light');
  document.documentElement.classList.remove('dark'); document.documentElement.style.colorScheme = 'light'; notify();
 };
 return { appearance, resolvedAppearance: 'light', updateAppearance } as const;
}
