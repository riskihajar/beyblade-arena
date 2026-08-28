import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogPopup,
    DialogTitle,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';
import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Check, Copy, ScanLine } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function GridScanIcon() {
    return (
        <div className="rounded-full border border-border bg-card p-0.5 shadow-sm">
            <div className="relative overflow-hidden rounded-full border border-border bg-muted p-2.5">
                <div className="absolute inset-0 grid grid-cols-5 opacity-50">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`col-${i + 1}`}
                            className="border-r border-border last:border-r-0"
                        />
                    ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-5 opacity-50">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`row-${i + 1}`}
                            className="border-b border-border last:border-b-0"
                        />
                    ))}
                </div>
                <ScanLine className="relative z-20 size-6 text-foreground" />
            </div>
        </div>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const { appearance } = useAppearance();
    const [copiedText, copy] = useClipboard();

    // Resolve actual appearance (handle 'system' mode)
    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
    const IconComponent = copiedText === manualSetupKey ? Check : Copy;

    if (errors?.length) {
        return (
            <>
                <DialogPanel>
                    <AlertError errors={errors} />
                </DialogPanel>
                <DialogFooter variant="bare">
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        onClick={onNextStep}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </>
        );
    }

    return (
        <>
            <DialogPanel className="space-y-5">
                <div className="mx-auto flex max-w-md overflow-hidden">
                    <div className="mx-auto aspect-square w-64 rounded-lg border border-border">
                        <div className="z-10 flex h-full w-full items-center justify-center p-5">
                            {qrCodeSvg ? (
                                <div
                                    className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                                    dangerouslySetInnerHTML={{
                                        __html: qrCodeSvg,
                                    }}
                                    style={{
                                        filter: isDark
                                            ? 'invert(1) brightness(1.5)'
                                            : undefined,
                                    }}
                                />
                            ) : (
                                <Spinner />
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative flex w-full items-center justify-center">
                    <div className="absolute inset-0 top-1/2 h-px w-full bg-border" />
                    <span className="relative bg-popover px-2 py-1 text-sm text-muted-foreground">
                        or, enter the code manually
                    </span>
                </div>

                <div className="flex w-full gap-2">
                    <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-border">
                        {!manualSetupKey ? (
                            <div className="flex h-full w-full items-center justify-center bg-muted p-3">
                                <Spinner />
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    readOnly
                                    value={manualSetupKey}
                                    className="h-full w-full bg-background p-3 text-foreground outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copy(manualSetupKey)}
                                    className="border-l border-border px-3 hover:bg-muted"
                                >
                                    <IconComponent className="w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </DialogPanel>
            <DialogFooter variant="bare">
                <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={onNextStep}
                >
                    {buttonText}
                </Button>
            </DialogFooter>
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            pinInputContainerRef.current?.querySelector('input')?.focus();
        }, 0);
    }, []);

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
            className="contents"
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <>
                    <DialogPanel>
                        <div
                            ref={pinInputContainerRef}
                            className="flex flex-col items-center gap-3"
                        >
                            <InputOTP
                                id="otp"
                                name="code"
                                maxLength={OTP_MAX_LENGTH}
                                onChange={setCode}
                                disabled={processing}
                                pattern={REGEXP_ONLY_DIGITS}
                            >
                                <InputOTPGroup>
                                    {Array.from(
                                        { length: OTP_MAX_LENGTH },
                                        (_, index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                            />
                                        ),
                                    )}
                                </InputOTPGroup>
                            </InputOTP>
                            <FieldError
                                error={
                                    errors?.confirmTwoFactorAuthentication
                                        ?.code ??
                                    (
                                        errors as
                                            Record<string, string> | undefined
                                    )?.code
                                }
                            />
                        </div>
                    </DialogPanel>
                    <DialogFooter variant="bare">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={processing}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing || code.length < OTP_MAX_LENGTH
                            }
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </>
            )}
        </Form>
    );
}

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
}

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: TwoFactorSetupModalProps) {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Two-Factor Authentication Enabled',
                description:
                    'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verify Authentication Code',
                description:
                    'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue',
            };
        }

        return {
            title: 'Enable Two-Factor Authentication',
            description:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }

        clearSetupData();
        onClose();
    }, [requiresConfirmation, clearSetupData, onClose]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);

        if (twoFactorEnabled) {
            clearSetupData();
        }
    }, [twoFactorEnabled, clearSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupData();
        }
    }, [isOpen, qrCodeSvg, fetchSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogPopup className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <GridScanIcon />
                    <DialogTitle>{modalConfig.title}</DialogTitle>
                    <DialogDescription>
                        {modalConfig.description}
                    </DialogDescription>
                </DialogHeader>

                {showVerificationStep ? (
                    <TwoFactorVerificationStep
                        onClose={onClose}
                        onBack={() => setShowVerificationStep(false)}
                    />
                ) : (
                    <TwoFactorSetupStep
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        buttonText={modalConfig.buttonText}
                        onNextStep={handleModalNextStep}
                        errors={errors}
                    />
                )}
            </DialogPopup>
        </Dialog>
    );
}
