import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className={cn(className)} {...props}>
            <Tabs
                value={appearance}
                onValueChange={(value) => updateAppearance(value as Appearance)}
            >
                <TabsList>
                    {tabs.map(({ value, icon: Icon, label }) => (
                        <TabsTab key={value} value={value}>
                            <Icon className="size-4" />
                            <span>{label}</span>
                        </TabsTab>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
