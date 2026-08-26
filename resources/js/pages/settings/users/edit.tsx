import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxPopup,
    ComboboxValue,
} from '@/components/ui/combobox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset';
import { FormInput } from '@/components/ui/form-input';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import type { User } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface RoleOption {
    value: string;
    label: string;
}

interface Props {
    user: User;
    roles: RoleOption[];
}

export default function UsersEdit({ user, roles }: Props) {
    const { users: usersRoutes } = settings;
    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        (user.roles?.map((r) => r.name) || []) as string[],
    );

    return (
        <>
            <Head title="Edit User" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'Users', href: usersRoutes.index().url },
                    {
                        title: 'Edit',
                        href: usersRoutes.edit({ user: user.id }).url,
                    },
                ]}
            >
                <div className="max-w-2xl px-4 py-8">
                    <Form
                        action={usersRoutes.update({ user: user.id })}
                        method="patch"
                        transform={(data) => ({
                            ...data,
                            roles: selectedRoles,
                        })}
                    >
                        {({ processing, errors }) => (
                            <>
                                <Frame>
                                    <FrameHeader>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                render={
                                                    <Link
                                                        href={
                                                            usersRoutes.index()
                                                                .url
                                                        }
                                                    >
                                                        <ArrowLeft className="size-4" />
                                                    </Link>
                                                }
                                            />
                                            <div>
                                                <FrameTitle>
                                                    Edit User
                                                </FrameTitle>
                                                <FrameDescription>
                                                    Update user information and
                                                    role
                                                </FrameDescription>
                                            </div>
                                        </div>
                                    </FrameHeader>
                                    <FramePanel>
                                        <div className="space-y-6">
                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Basic Information
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <FormInput
                                                        name="name"
                                                        label="Name"
                                                        placeholder="John Doe"
                                                        defaultValue={user.name}
                                                        required
                                                        errors={errors}
                                                    />
                                                    <FormInput
                                                        name="email"
                                                        label="Email"
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        defaultValue={
                                                            user.email
                                                        }
                                                        required
                                                        errors={errors}
                                                    />
                                                </div>
                                            </Fieldset>

                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Security
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <p className="text-xs text-muted-foreground">
                                                        Leave password fields
                                                        blank to keep the
                                                        current password.
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <FormInput
                                                            name="password"
                                                            label="New Password"
                                                            type="password"
                                                            placeholder="Enter new password"
                                                            errors={errors}
                                                        />
                                                        <FormInput
                                                            name="password_confirmation"
                                                            label="Confirm Password"
                                                            type="password"
                                                            placeholder="Confirm new password"
                                                            errors={errors}
                                                        />
                                                    </div>
                                                </div>
                                            </Fieldset>

                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Role Assignment
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <Field
                                                        name="roles"
                                                        data-invalid={
                                                            !!errors.roles ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="roles">
                                                            Roles
                                                        </FieldLabel>
                                                        <Combobox
                                                            items={roles}
                                                            multiple
                                                            value={roles.filter(
                                                                (role) =>
                                                                    selectedRoles.includes(
                                                                        role.value,
                                                                    ),
                                                            )}
                                                            onValueChange={(
                                                                val,
                                                            ) =>
                                                                setSelectedRoles(
                                                                    val.map(
                                                                        (v) =>
                                                                            v.value,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <ComboboxChips>
                                                                <ComboboxValue>
                                                                    {(
                                                                        selected: RoleOption[],
                                                                    ) => (
                                                                        <>
                                                                            {selected?.map(
                                                                                (
                                                                                    item,
                                                                                ) => (
                                                                                    <ComboboxChip
                                                                                        key={
                                                                                            item.value
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            item.label
                                                                                        }
                                                                                    </ComboboxChip>
                                                                                ),
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </ComboboxValue>
                                                                <ComboboxInput placeholder="Select roles..." />
                                                            </ComboboxChips>
                                                            <ComboboxPopup>
                                                                <ComboboxEmpty>
                                                                    No results
                                                                    found.
                                                                </ComboboxEmpty>
                                                                <ComboboxList>
                                                                    {(item) => (
                                                                        <ComboboxItem
                                                                            key={
                                                                                item.value
                                                                            }
                                                                            value={
                                                                                item
                                                                            }
                                                                        >
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </ComboboxItem>
                                                                    )}
                                                                </ComboboxList>
                                                            </ComboboxPopup>
                                                        </Combobox>
                                                    </Field>
                                                </div>
                                            </Fieldset>
                                        </div>
                                    </FramePanel>
                                </Frame>
                                <div className="mt-4 flex gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Update User
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        render={
                                            <Link
                                                href={usersRoutes.index().url}
                                            >
                                                Cancel
                                            </Link>
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </AppLayout>
        </>
    );
}
