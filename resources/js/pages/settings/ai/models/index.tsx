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
    Check,
    Edit,
    MoreHorizontal,
    Plus,
    Power,
    PowerOff,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface AiModelItem {
    id: string;
    model_id: string;
    name: string;
    provider_name: string | null;
    provider_slug: string | null;
    supports_web_search: boolean;
    supports_attachments: boolean;
    supports_images: boolean;
    supports_documents: boolean;
    supports_provider_storage: boolean;
    is_default: boolean;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    models: AiModelItem[];
}

type ToggleAction = {
    ids: string[];
    is_active: boolean;
    names: string[];
};

function CapabilityIcon({ enabled }: { enabled: boolean }) {
    return enabled ? (
        <Check className="size-4 text-green-600" />
    ) : (
        <X className="size-4 text-muted-foreground/40" />
    );
}

export default function ModelsIndex({ models }: Props) {
    const { ai } = settings;
    const [deleteModel, setDeleteModel] = useState<AiModelItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toggleAction, setToggleAction] = useState<ToggleAction | null>(null);

    // ─── Selection helpers ─────────────────────────────────────
    const allSelected = useMemo(
        () => models.length > 0 && selectedIds.size === models.length,
        [models.length, selectedIds.size],
    );

    const someSelected = useMemo(
        () => selectedIds.size > 0 && selectedIds.size < models.length,
        [models.length, selectedIds.size],
    );

    const toggleSelectAll = useCallback(
        (checked: boolean) => {
            setSelectedIds(
                checked ? new Set(models.map((m) => m.id)) : new Set(),
            );
        },
        [models],
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
        if (deleteModel) {
            router.delete(ai.models.destroy({ model: deleteModel.id }).url);
            setDeleteModel(null);
        }
    }, [deleteModel, ai.models]);

    // ─── Toggle active ─────────────────────────────────────────
    const openToggleModal = useCallback(
        (ids: string[], is_active: boolean) => {
            const names = models
                .filter((m) => ids.includes(m.id))
                .map((m) => m.name);
            setToggleAction({ ids, is_active, names });
        },
        [models],
    );

    const confirmToggle = useCallback(() => {
        if (toggleAction) {
            router.patch(
                ai.models.toggleActive().url,
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
    }, [toggleAction, ai.models]);

    return (
        <>
            <Head title="AI Models" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'AI Models', href: ai.models.index().url },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-semibold">
                                    AI Models
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage AI models and their capabilities.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    render={
                                        <Link
                                            href={ai.providers.index().url}
                                            className="flex items-center"
                                        >
                                            Providers
                                        </Link>
                                    }
                                    variant="outline"
                                />
                                <Button
                                    render={
                                        <Link
                                            href={ai.models.create().url}
                                            className="flex items-center"
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Add Model
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
                                                aria-label="Select all models"
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Model ID</TableHead>
                                        <TableHead>Provider</TableHead>
                                        <TableHead className="text-center">
                                            Web
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Files
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Images
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {models.length > 0 ? (
                                        models.map((model) => (
                                            <TableRow key={model.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(
                                                            model.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            toggleSelectRow(
                                                                model.id,
                                                                !!checked,
                                                            )
                                                        }
                                                        aria-label={`Select ${model.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {model.name}
                                                        {model.is_default && (
                                                            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                        {model.model_id}
                                                    </code>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {model.provider_name ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <CapabilityIcon
                                                        enabled={
                                                            model.supports_web_search
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <CapabilityIcon
                                                        enabled={
                                                            model.supports_attachments
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <CapabilityIcon
                                                        enabled={
                                                            model.supports_images
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            model.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {model.is_active
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
                                                                            ai.models.edit(
                                                                                {
                                                                                    model: model.id,
                                                                                },
                                                                            )
                                                                                .url
                                                                        }
                                                                        className="flex w-full items-center gap-2"
                                                                    >
                                                                        <Edit className="size-4" />
                                                                        Edit
                                                                        Model
                                                                    </Link>
                                                                </MenuItem>
                                                                <MenuItem
                                                                    onClick={() =>
                                                                        openToggleModal(
                                                                            [
                                                                                model.id,
                                                                            ],
                                                                            !model.is_active,
                                                                        )
                                                                    }
                                                                >
                                                                    {model.is_active ? (
                                                                        <>
                                                                            <PowerOff className="mr-2 size-4" />
                                                                            Disable
                                                                            Model
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Power className="mr-2 size-4" />
                                                                            Enable
                                                                            Model
                                                                        </>
                                                                    )}
                                                                </MenuItem>
                                                                <MenuSeparator />
                                                                <MenuItem
                                                                    onClick={() =>
                                                                        setDeleteModel(
                                                                            model,
                                                                        )
                                                                    }
                                                                    variant="destructive"
                                                                >
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    Delete Model
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
                                                colSpan={9}
                                                className="h-24 text-center"
                                            >
                                                No models configured.
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
                open={!!deleteModel}
                onOpenChange={() => setDeleteModel(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Model</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleteModel?.name}?
                            This action cannot be undone.
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
                                ? 'Models'
                                : 'Model'}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to{' '}
                            {toggleAction?.is_active ? 'enable' : 'disable'}{' '}
                            {toggleAction && toggleAction.ids.length > 1
                                ? `${toggleAction.ids.length} models`
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
