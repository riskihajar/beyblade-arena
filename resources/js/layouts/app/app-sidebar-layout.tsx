import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { toastManager } from '@/components/ui/toast';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useRef } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { flash } = usePage<SharedData>().props;
    const mounted = useRef<SharedData['flash'] | null>(null);

    useEffect(() => {
        // Prevent double toast in strict mode or initial mount race conditions
        if (mounted.current === flash) return;
        mounted.current = flash;

        if (flash?.success) {
            toastManager.add({
                title: flash.success,
                type: 'success',
            });
        }
        if (flash?.error) {
            toastManager.add({
                title: flash.error,
                type: 'error',
            });
        }
        if (flash?.info) {
            toastManager.add({
                title: flash.info,
                type: 'info',
            });
        }
    }, [flash]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
