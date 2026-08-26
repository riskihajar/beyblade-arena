import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <SettingsLayout>
                <Frame>
                    <FrameHeader>
                        <div className="flex items-center gap-3">
                            <FrameTitle>Two-Factor Authentication</FrameTitle>
                            <Badge
                                variant={
                                    twoFactorEnabled ? 'default' : 'destructive'
                                }
                            >
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                        <FrameDescription>
                            {twoFactorEnabled
                                ? 'Two-factor authentication is currently enabled. You will be prompted for a secure code during login.'
                                : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
                        </FrameDescription>
                    </FrameHeader>
                    <FramePanel>
                        {twoFactorEnabled ? (
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    With two-factor authentication enabled, you
                                    will be prompted for a secure, random pin
                                    during login, which you can retrieve from
                                    the TOTP-supported application on your
                                    phone.
                                </p>

                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <ShieldBan />
                                            Disable 2FA
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    When you enable two-factor authentication,
                                    you will be prompted for a secure pin during
                                    login. This pin can be retrieved from a
                                    TOTP-supported application on your phone.
                                </p>

                                {hasSetupData ? (
                                    <Button
                                        type="button"
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck />
                                        Continue Setup
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldCheck />
                                                Enable 2FA
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        )}
                    </FramePanel>
                </Frame>

                {twoFactorEnabled && (
                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                )}

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </SettingsLayout>
        </AppLayout>
    );
}
