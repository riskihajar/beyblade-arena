import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Frame } from '@/components/ui/frame';
import {
    Menu,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuPopup,
    MenuSeparator,
    MenuTrigger,
} from '@/components/ui/menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    MoreHorizontal,
    Plus,
    Power,
    PowerOff,
    Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface AiProvider {
    id: string;
    slug: string;
    name: string;
    driver: string;
    base_url: string | null;
    is_active: boolean;
    sort_order: number;
    models_count: number;
    created_at: string | null;
}

interface Props {
    providers: AiProvider[];
}

type ToggleAction = {
    ids: string[];
    is_active: boolean;
    names: string[];
};

export default function ProvidersIndex({ providers }: Props) {
    const { ai } = settings;
    const [deleteProvider, setDeleteProvider] = useState<AiProvider | null>(
        null,
    );
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toggleAction, setToggleAction] = useState<ToggleAction | null>(null);

    // ─── Selection helpers ─────────────────────────────────────
    const allSelected = useMemo(
        () => providers.length > 0 && selectedIds.size === providers.length,
        [providers.length, selectedIds.size],
    );

    const someSelected = useMemo(
        () => selectedIds.size > 0 && selectedIds.size < providers.length,
        [providers.length, selectedIds.size],
    );

    const toggleSelectAll = useCallback(
        (checked: boolean) => {
            setSelectedIds(
                checked ? new Set(providers.map((p) => p.id)) : new Set(),
            );
        },
        [providers],
    );

    const toggleSelectRow = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    // ─── Delete ────────────────────────────────────────────────
    const confirmDelete = useCallback(() => {
        if (deleteProvider) {
            router.delete(
                ai.providers.destroy({ provider: deleteProvider.id }).url,
            );
            setDeleteProvider(null);
        }
    }, [deleteProvider, ai.providers]);

    // ─── Toggle active ─────────────────────────────────────────
    const openToggleModal = useCallback(
        (ids: string[], is_active: boolean) => {
            const names = providers
                .filter((p) => ids.includes(p.id))
                .map((p) => p.name);
            setToggleAction({ ids, is_active, names });
        },
        [providers],
    );

    const confirmToggle = useCallback(() => {
        if (toggleAction) {
            router.patch(
                ai.providers.toggleActive().url,
                {
                    ids: toggleAction.ids,
                    is_active: toggleAction.is_active,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds(new Set());
                    },
                },
            );
            setToggleAction(null);
        }
    }, [toggleAction, ai.providers]);

    // Active models warning for providers being disabled
    const disablingProvidersWithModels = useMemo(() => {
        if (!toggleAction || toggleAction.is_active) return [];
        return providers.filter(
            (p) =>
                toggleAction.ids.includes(p.id) &&
                p.is_active &&
                p.models_count > 0,
        );
    }, [toggleAction, providers]);

    return (
        <>
            <Head title="AI Providers" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'AI Providers', href: ai.providers.index().url },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-semibold">
                                    AI Providers
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage AI provider connections and API keys.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    render={
                                        <Link
                                            href={ai.models.index().url}
                                            className="flex items-center"
                                        >
                                            Models
                                        </Link>
                                    }
                                    variant="outline"
                                />
                                <Button
                                    render={
                                        <Link
                                            href={ai.providers.create().url}
                                            className="flex items-center"
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Add Provider
                                        </Link>
                                    }
                                />
                            </div>
                        </div>

                        {/* Bulk action bar */}
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
                                <span className="text-sm font-medium">
                                    {selectedIds.size} selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            openToggleModal(
                                                [...selectedIds],
                                                true,
                                            )
                                        }
                                    >
                                        <Power className="mr-1.5 size-3.5" />
                                        Enable
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            openToggleModal(
                                                [...selectedIds],
                                                false,
                                            )
                                        }
                                    >
                                        <PowerOff className="mr-1.5 size-3.5" />
                                        Disable
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Frame className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={allSelected}
                                                indeterminate={someSelected}
                                                onCheckedChange={
                                                    toggleSelectAll
                                                }
                                                aria-label="Select all providers"
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Base URL</TableHead>
                                        <TableHead>Models</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {providers.length > 0 ? (
                                        providers.map((provider) => (
                                            <TableRow key={provider.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(
                                                            provider.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            toggleSelectRow(
                                                                provider.id,
                                                                !!checked,
                                                            )
                                                        }
                                                        aria-label={`Select ${provider.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {provider.name}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                        {provider.slug}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {provider.driver}
                                                </TableCell>
                                                <TableCell className="max-w-48 truncate text-muted-foreground">
                                                    {provider.base_url || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground">
                                                        {provider.models_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            provider.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {provider.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Menu>
                                                        <MenuTrigger
                                                            render={
                                                                <Button
                                                                    variant="ghost"
                                                                    className="size-8 p-0"
                                                                >
                                                                    <span className="sr-only">
                                                                        Open
                                                                        menu
                                                                    </span>
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <MenuPopup
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <MenuGroup>
                                                                <MenuGroupLabel>
                                                                    Actions
                                                                </MenuGroupLabel>
                                                                <MenuItem>
                                                                    <Link
                                                                        href={
                                                                            ai.providers.edit(
                                                                                {
                                                                                    provider:
                                                                                        provider.id,
                                                                                },
                                                                            )
                                                                                .url
                                                                        }
                                                                        className="flex w-full items-center gap-2"
                                                                    >
                                                                        <Edit className="size-4" />
                                                                        Edit
                                                                        Provider
                                                                    </Link>
                                                                </MenuItem>
                                                                <MenuItem
                                                                    onClick={() =>
                                                                        openToggleModal(
                                                                            [
                                                                                provider.id,
                                                                            ],
                                                                            !provider.is_active,
                                                                        )
                                                                    }
                                                                >
                                                                    {provider.is_active ? (
                                                                        <>
                                                                            <PowerOff className="mr-2 size-4" />
                                                                            Disable
                                                                            Provider
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Power className="mr-2 size-4" />
                                                                            Enable
                                                                            Provider
                                                                        </>
                                                                    )}
                                                                </MenuItem>
                                                                <MenuSeparator />
                                                                <MenuItem
                                                                    onClick={() =>
                                                                        setDeleteProvider(
                                                                            provider,
                                                                        )
                                                                    }
                                                                    variant="destructive"
                                                                >
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    Delete
                                                                    Provider
                                                                </MenuItem>
                                                            </MenuGroup>
                                                        </MenuPopup>
                                                    </Menu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="h-24 text-center"
                                            >
                                                No providers configured.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Frame>
                    </div>
                </div>
            </AppLayout>

            {/* Delete confirmation */}
            <Dialog
                open={!!deleteProvider}
                onOpenChange={() => setDeleteProvider(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Provider</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            {deleteProvider?.name}? This will also delete all
                            associated models. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Toggle active confirmation */}
            <Dialog
                open={!!toggleAction}
                onOpenChange={() => setToggleAction(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {toggleAction?.is_active ? 'Enable' : 'Disable'}{' '}
                            {toggleAction && toggleAction.ids.length > 1
                                ? 'Providers'
                                : 'Provider'}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to{' '}
                            {toggleAction?.is_active ? 'enable' : 'disable'}{' '}
                            {toggleAction && toggleAction.ids.length > 1
                                ? `${toggleAction.ids.length} providers`
                                : toggleAction?.names[0]}
                            ?
                        </DialogDescription>
                    </DialogHeader>

                    {/* Item list */}
                    {toggleAction && toggleAction.names.length > 1 && (
                        <ul className="max-h-32 overflow-y-auto text-sm text-muted-foreground">
                            {toggleAction.names.map((name) => (
                                <li key={name} className="py-0.5">
                                    • {name}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Warning for disabling providers with active models */}
                    {disablingProvidersWithModels.length > 0 && (
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                            <strong>Warning:</strong>{' '}
                            {disablingProvidersWithModels
                                .map(
                                    (p) =>
                                        `${p.name} (${p.models_count} model${p.models_count !== 1 ? 's' : ''})`,
                                )
                                .join(', ')}{' '}
                            {disablingProvidersWithModels.length === 1
                                ? 'has'
                                : 'have'}{' '}
                            active models that will no longer appear in search
                            results.
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button onClick={confirmToggle}>
                            {toggleAction?.is_active ? 'Enable' : 'Disable'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
