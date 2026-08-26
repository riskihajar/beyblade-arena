import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { type BreadcrumbItem } from '@/types';

import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <Frame>
                    <FrameHeader>
                        <FrameTitle>Appearance settings</FrameTitle>
                        <FrameDescription>
                            Update your account's appearance settings
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel>
                        <AppearanceTabs />
                    </FramePanel>
                </Frame>
            </SettingsLayout>
        </AppLayout>
    );
}
