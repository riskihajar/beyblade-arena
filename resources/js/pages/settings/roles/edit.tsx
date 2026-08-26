import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset';
import { FormInput } from '@/components/ui/form-input';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import type { Permission, Role } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Props {
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function RolesEdit({ role, permissions }: Props) {
    const { roles: rolesRoutes } = settings;
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        role.permissions?.map((p) => p.name) || [],
    );

    return (
        <>
            <Head title="Edit Role" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'Roles', href: rolesRoutes.index().url },
                    {
                        title: 'Edit',
                        href: rolesRoutes.edit({ role: role.id }).url,
                    },
                ]}
            >
                <div className="max-w-2xl px-4 py-8">
                    <Form
                        action={rolesRoutes.update({ role: role.id })}
                        method="patch"
                        transform={(data) => ({
                            ...data,
                            permissions: selectedPermissions,
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
                                                            rolesRoutes.index()
                                                                .url
                                                        }
                                                    >
                                                        <ArrowLeft className="size-4" />
                                                    </Link>
                                                }
                                            />
                                            <div>
                                                <FrameTitle>
                                                    Edit Role
                                                </FrameTitle>
                                                <FrameDescription>
                                                    Update role information and
                                                    permissions
                                                </FrameDescription>
                                            </div>
                                        </div>
                                    </FrameHeader>
                                    <FramePanel>
                                        <div className="space-y-6">
                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Role Details
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <FormInput
                                                        name="name"
                                                        label="Role Name"
                                                        defaultValue={role.name}
                                                        placeholder="e.g. manager, editor"
                                                        required
                                                        errors={errors}
                                                    />
                                                </div>
                                            </Fieldset>

                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Permissions
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <div className="space-y-4">
                                                        {Object.entries(
                                                            permissions,
                                                        ).map(
                                                            ([
                                                                group,
                                                                groupPermissions,
                                                            ]) => (
                                                                <div
                                                                    key={group}
                                                                    className="rounded-md border"
                                                                >
                                                                    <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2">
                                                                        <Label
                                                                            htmlFor={`group-${group}`}
                                                                            className="cursor-pointer font-semibold capitalize"
                                                                        >
                                                                            {
                                                                                group
                                                                            }
                                                                        </Label>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
                                                                        {groupPermissions.map(
                                                                            (
                                                                                permission,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        permission.id
                                                                                    }
                                                                                    className="flex items-center gap-2"
                                                                                >
                                                                                    <Checkbox
                                                                                        id={
                                                                                            permission.name
                                                                                        }
                                                                                        checked={selectedPermissions.includes(
                                                                                            permission.name,
                                                                                        )}
                                                                                        onCheckedChange={(
                                                                                            checked,
                                                                                        ) => {
                                                                                            if (
                                                                                                checked
                                                                                            ) {
                                                                                                setSelectedPermissions(
                                                                                                    [
                                                                                                        ...selectedPermissions,
                                                                                                        permission.name,
                                                                                                    ],
                                                                                                );
                                                                                            } else {
                                                                                                setSelectedPermissions(
                                                                                                    selectedPermissions.filter(
                                                                                                        (
                                                                                                            p,
                                                                                                        ) =>
                                                                                                            p !==
                                                                                                            permission.name,
                                                                                                    ),
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <Label
                                                                                        htmlFor={
                                                                                            permission.name
                                                                                        }
                                                                                        className="cursor-pointer text-sm"
                                                                                    >
                                                                                        {permission.name
                                                                                            .split(
                                                                                                '.',
                                                                                            )
                                                                                            .pop()}
                                                                                    </Label>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </Fieldset>
                                        </div>
                                    </FramePanel>
                                </Frame>
                                <div className="mt-4 flex gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Update Role
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        render={
                                            <Link
                                                href={rolesRoutes.index().url}
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
