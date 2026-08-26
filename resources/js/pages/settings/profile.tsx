import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import { AvatarForm } from '@/components/settings/profile/avatar-form';
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
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <AvatarForm
                    avatarUrl={
                        auth.user.avatar_url as string | null | undefined
                    }
                    userName={auth.user.name}
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                >
                    {({ processing, recentlySuccessful, errors }) => (
                        <>
                            <Frame>
                                <FrameHeader>
                                    <FrameTitle>Profile information</FrameTitle>
                                    <FrameDescription>
                                        Update your name and email address
                                    </FrameDescription>
                                </FrameHeader>
                                <FramePanel>
                                    <div className="flex flex-col gap-4">
                                        <Field
                                            data-invalid={
                                                !!errors.name || undefined
                                            }
                                        >
                                            <FieldLabel htmlFor="name">
                                                Name
                                            </FieldLabel>
                                            <Input
                                                id="name"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                                aria-invalid={
                                                    !!errors.name || undefined
                                                }
                                                aria-describedby={
                                                    errors.name
                                                        ? 'name-error'
                                                        : undefined
                                                }
                                            />
                                            <FieldError
                                                error={errors.name}
                                                id="name-error"
                                            />
                                        </Field>

                                        <Field
                                            data-invalid={
                                                !!errors.email || undefined
                                            }
                                        >
                                            <FieldLabel htmlFor="email">
                                                Email address
                                            </FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                                aria-invalid={
                                                    !!errors.email || undefined
                                                }
                                                aria-describedby={
                                                    errors.email
                                                        ? 'email-error'
                                                        : undefined
                                                }
                                            />
                                            <FieldError
                                                error={errors.email}
                                                id="email-error"
                                            />
                                        </Field>
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div className="mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send().url}
                                                        method="post"
                                                        as="button"
                                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </FramePanel>
                            </Frame>
                            <div className="mt-4 flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    Save
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

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
