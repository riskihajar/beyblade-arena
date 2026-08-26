import Heading from '@/components/heading';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show as twoFactorShow } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { router, usePage } from '@inertiajs/react';
import { KeyRound, LucideIcon, Palette, ShieldCheck, User } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface SettingsNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    value: string;
}

const sidebarNavItems: SettingsNavItem[] = [
    {
        title: 'Profile',
        href: edit().url,
        icon: User,
        value: 'profile',
    },
    {
        title: 'Password',
        href: editPassword().url,
        icon: KeyRound,
        value: 'password',
    },
    {
        title: 'Two-Factor Auth',
        href: twoFactorShow().url,
        icon: ShieldCheck,
        value: 'two-factor',
    },
    {
        title: 'Appearance',
        href: editAppearance().url,
        icon: Palette,
        value: 'appearance',
    },
];

function getActiveTab(currentPath: string): string {
    const item = sidebarNavItems.find((item) => currentPath === item.href);
    return item?.value ?? 'profile';
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const currentPath = page.url;
    const activeTab = getActiveTab(currentPath);

    if (typeof window === 'undefined') {
        return null;
    }

    const handleTabChange = (value: string | null) => {
        if (!value) return;
        const item = sidebarNavItems.find((item) => item.value === value);
        if (item) {
            router.visit(item.href);
        }
    };

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <Tabs
                className="w-full"
                value={activeTab}
                onValueChange={handleTabChange}
                orientation="vertical"
            >
                <TabsList className="w-48 shrink-0 self-start">
                    {sidebarNavItems.map((item) => (
                        <TabsTab key={item.value} value={item.value}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                        </TabsTab>
                    ))}
                </TabsList>
                <TabsPanel value={activeTab} className="md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </TabsPanel>
            </Tabs>
        </div>
    );
}
