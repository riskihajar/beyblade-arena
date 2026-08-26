import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { regenerateRecoveryCodes } from '@/routes/two-factor';
import { Form } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TwoFactorRecoveryCodesProps {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
}

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: TwoFactorRecoveryCodesProps) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLUListElement | null>(null);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);

        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;

    return (
        <Frame>
            <FrameHeader>
                <FrameTitle className="flex items-center gap-2">
                    <LockKeyhole className="size-4" aria-hidden="true" />
                    Recovery Codes
                </FrameTitle>
                <FrameDescription>
                    Recovery codes let you regain access if you lose your 2FA
                    device. Store them in a secure password manager.
                </FrameDescription>
            </FrameHeader>
            <FramePanel>
                <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        type="button"
                        onClick={toggleCodesVisibility}
                        className="w-fit"
                        aria-expanded={codesAreVisible}
                        aria-controls="recovery-codes-section"
                    >
                        <RecoveryCodeIconComponent
                            className="size-4"
                            aria-hidden="true"
                        />
                        {codesAreVisible ? 'Hide' : 'View'} Recovery Codes
                    </Button>

                    {canRegenerateCodes && (
                        <Form
                            {...regenerateRecoveryCodes.form()}
                            options={{ preserveScroll: true }}
                            onSuccess={fetchRecoveryCodes}
                        >
                            {({ processing }) => (
                                <Button
                                    variant="secondary"
                                    type="submit"
                                    disabled={processing}
                                    aria-describedby="regenerate-warning"
                                >
                                    <RefreshCw /> Regenerate Codes
                                </Button>
                            )}
                        </Form>
                    )}
                </div>

                <div
                    id="recovery-codes-section"
                    className={`relative overflow-hidden transition-all duration-300 ${codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}
                    aria-hidden={!codesAreVisible}
                >
                    <div className="mt-4 space-y-3">
                        {errors?.length ? (
                            <AlertError errors={errors} />
                        ) : (
                            <>
                                <ul
                                    ref={codesSectionRef}
                                    className="grid gap-1 rounded-lg bg-muted p-4 font-mono text-sm"
                                >
                                    {recoveryCodesList.length ? (
                                        recoveryCodesList.map((code) => (
                                            <li
                                                key={code}
                                                className="select-text"
                                            >
                                                {code}
                                            </li>
                                        ))
                                    ) : (
                                        <>
                                            {Array.from(
                                                { length: 8 },
                                                (_, index) => (
                                                    <li
                                                        key={`skeleton-${index}`}
                                                        className="h-4 animate-pulse rounded bg-muted-foreground/20"
                                                        aria-hidden="true"
                                                    />
                                                ),
                                            )}
                                        </>
                                    )}
                                </ul>

                                <p
                                    id="regenerate-warning"
                                    className="text-xs text-muted-foreground select-none"
                                >
                                    Each recovery code can be used once to
                                    access your account and will be removed
                                    after use. If you need more, click{' '}
                                    <span className="font-bold">
                                        Regenerate Codes
                                    </span>{' '}
                                    above.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </FramePanel>
        </Frame>
    );
}
