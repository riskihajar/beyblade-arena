import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-4">
                            <Field
                                name="email"
                                data-invalid={!!errors.email || undefined}
                            >
                                <FieldLabel htmlFor="email">
                                    Email address
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    aria-invalid={!!errors.email || undefined}
                                    aria-describedby={
                                        errors.email ? 'email-error' : undefined
                                    }
                                />
                                <FieldError
                                    error={errors.email}
                                    id="email-error"
                                />
                            </Field>

                            <Field
                                name="password"
                                data-invalid={!!errors.password || undefined}
                            >
                                <div className="flex w-full items-center justify-between gap-4">
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm"
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    aria-invalid={
                                        !!errors.password || undefined
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

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" />
                                <label
                                    htmlFor="remember"
                                    className="inline-flex items-center gap-2 text-base/4.5 font-medium sm:text-sm/4"
                                >
                                    Remember me
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()}>Sign up</TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
