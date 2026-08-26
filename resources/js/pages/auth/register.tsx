import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-4">
                            <Field
                                name="name"
                                data-invalid={!!errors.name || undefined}
                            >
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    aria-invalid={!!errors.name || undefined}
                                    aria-describedby={
                                        errors.name ? 'name-error' : undefined
                                    }
                                />
                                <FieldError
                                    error={errors.name}
                                    id="name-error"
                                />
                            </Field>

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
                                    required
                                    autoComplete="email"
                                    name="email"
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
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    name="password"
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

                            <Field
                                name="password_confirmation"
                                data-invalid={
                                    !!errors.password_confirmation || undefined
                                }
                            >
                                <FieldLabel htmlFor="password_confirmation">
                                    Confirm password
                                </FieldLabel>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    name="password_confirmation"
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
                                    error={errors.password_confirmation}
                                    id="password_confirmation-error"
                                />
                            </Field>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()}>Log in</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
