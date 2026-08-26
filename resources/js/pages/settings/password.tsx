import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <Form
                    {...PasswordController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnSuccess={['password', 'password_confirmation']}
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }
                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                >
                    {({ errors, processing, recentlySuccessful }) => (
                        <>
                            <Frame>
                                <FrameHeader>
                                    <FrameTitle>Update password</FrameTitle>
                                    <FrameDescription>
                                        Ensure your account is using a long,
                                        random password to stay secure
                                    </FrameDescription>
                                </FrameHeader>
                                <FramePanel>
                                    <div className="flex flex-col gap-4">
                                        <Field
                                            data-invalid={
                                                !!errors.current_password ||
                                                undefined
                                            }
                                        >
                                            <FieldLabel htmlFor="current_password">
                                                Current password
                                            </FieldLabel>
                                            <Input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                type="password"
                                                autoComplete="current-password"
                                                placeholder="Current password"
                                                aria-invalid={
                                                    !!errors.current_password ||
                                                    undefined
                                                }
                                                aria-describedby={
                                                    errors.current_password
                                                        ? 'current_password-error'
                                                        : undefined
                                                }
                                            />
                                            <FieldError
                                                error={errors.current_password}
                                                id="current_password-error"
                                            />
                                        </Field>

                                        <Field
                                            data-invalid={
                                                !!errors.password || undefined
                                            }
                                        >
                                            <FieldLabel htmlFor="password">
                                                New password
                                            </FieldLabel>
                                            <Input
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="New password"
                                                aria-invalid={
                                                    !!errors.password ||
                                                    undefined
                                                }
                                                aria-describedby={
                                                    errors.password
                                                        ? 'password-error'
                                                        : undefined
                                                }
                                            />
                                            <FieldError
                                                error={errors.password}
                                                id="password-error"
                                            />
                                        </Field>

                                        <Field
                                            data-invalid={
                                                !!errors.password_confirmation ||
                                                undefined
                                            }
                                        >
                                            <FieldLabel htmlFor="password_confirmation">
                                                Confirm password
                                            </FieldLabel>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                                aria-invalid={
                                                    !!errors.password_confirmation ||
                                                    undefined
                                                }
                                                aria-describedby={
                                                    errors.password_confirmation
                                                        ? 'password_confirmation-error'
                                                        : undefined
                                                }
                                            />
                                            <FieldError
                                                error={
                                                    errors.password_confirmation
                                                }
                                                id="password_confirmation-error"
                                            />
                                        </Field>
                                    </div>
                                </FramePanel>
                            </Frame>
                            <div className="mt-4 flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    Save password
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">
                                        Saved
                                    </p>
                                </Transition>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsLayout>
        </AppLayout>
    );
}
