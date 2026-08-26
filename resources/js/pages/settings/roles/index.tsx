import { ExportDropdown } from '@/components/export/export-dropdown';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
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
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Menu,
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuPopup,
    MenuSeparator,
    MenuTrigger,
} from '@/components/ui/menu';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TableColumnHeader } from '@/components/ui/table-column-header';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import type { Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Download,
    Edit,
    FileJson,
    FileSpreadsheet,
    FileText,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface PaginatedRoles {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links:
        | {
              first: string | null;
              last: string | null;
              prev: string | null;
              next: string | null;
          }
        | Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    roles: PaginatedRoles;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
        per_page?: string | number;
    };
}

export default function RolesIndex({ roles, filters }: Props) {
    const { roles: rolesRoutes } = settings;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(
        filters.per_page?.toString() || '10',
    );
    const [isLoading, setIsLoading] = useState(false);
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentPerPage = roles.per_page?.toString() ?? '10';
            const hasSearchChanged = searchQuery !== (filters.search || '');
            const hasPerPageChanged = perPage !== currentPerPage;

            if (hasSearchChanged || hasPerPageChanged) {
                const params: Record<string, string> = {};
                if (searchQuery) {
                    params.search = searchQuery;
                }
                if (perPage) {
                    params.per_page = perPage;
                }

                // Preserve sort and direction if they exist
                const sortValue = filters.sort;
                const directionValue = filters.direction;
                if (sortValue && typeof sortValue === 'string') {
                    params.sort = sortValue;
                    params.direction =
                        directionValue && typeof directionValue === 'string'
                            ? directionValue
                            : 'asc';
                }

                router.get(rolesRoutes.index().url, params, {
                    preserveState: true,
                    replace: true,
                    onStart: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [
        searchQuery,
        perPage,
        filters.search,
        roles.per_page,
        rolesRoutes,
        filters.sort,
        filters.direction,
    ]);

    useEffect(() => {
        const sortValue = filters.sort;
        const directionValue = filters.direction;

        if (sortValue && typeof sortValue === 'string') {
            const direction = directionValue === 'desc' ? 'desc' : 'asc';
            setSorting([{ id: sortValue, desc: direction === 'desc' }]);
        } else {
            setSorting([]);
        }
    }, [filters.sort, filters.direction]);

    const buildParams = useCallback(() => {
        const params: Record<string, string | number> = {};

        if (searchQuery) params.search = searchQuery;
        if (perPage && perPage !== '10') {
            params.per_page = parseInt(perPage, 10);
        }
        if (sorting.length > 0) {
            params.sort = sorting[0].id;
            params.direction = sorting[0].desc ? 'desc' : 'asc';
            params.page = roles.current_page;
        }

        return params;
    }, [searchQuery, perPage, sorting, roles.current_page]);

    useEffect(() => {
        if (sorting.length > 0) {
            router.get(rolesRoutes.index().url, buildParams(), {
                preserveState: true,
                replace: true,
            });
        }
    }, [sorting, rolesRoutes, buildParams]);

    const handleDelete = useCallback(
        (roleId: string) => {
            router.delete(rolesRoutes.destroy({ role: roleId }).url);
        },
        [rolesRoutes],
    );

    const confirmDelete = useCallback(() => {
        if (deleteRole) {
            handleDelete(deleteRole.id);
            setDeleteRole(null);
        }
    }, [deleteRole, handleDelete]);

    const filteredRoles = useMemo(() => {
        return roles.data;
    }, [roles.data]);

    const columns = useMemo<ColumnDef<Role>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Name"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">{row.getValue('name')}</span>
                ),
            },
            {
                id: 'permissions',
                accessorFn: (row) => row.permissions?.length ?? 0,
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Permissions"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const role = row.original;
                    return (
                        <span className="text-muted-foreground">
                            {role.permissions?.length ?? 0} permissions
                        </span>
                    );
                },
            },
            {
                id: 'users',
                accessorFn: (row) => row.users_count ?? 0,
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Users"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const role = row.original;
                    return (
                        <span className="text-muted-foreground">
                            {role.users_count ?? 0} users
                        </span>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Created"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) =>
                    new Date(row.getValue('created_at')).toLocaleDateString(),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const role = row.original;
                    return (
                        <Menu>
                            <MenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        className="size-8 p-0"
                                    >
                                        <span className="sr-only">
                                            Open menu
                                        </span>
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                }
                            />
                            <MenuPopup align="end" className="w-48">
                                <MenuGroup>
                                    <MenuGroupLabel>Actions</MenuGroupLabel>
                                    <MenuItem>
                                        <Link
                                            href={
                                                rolesRoutes.edit({
                                                    role: role.id,
                                                }).url
                                            }
                                            className="flex w-full items-center gap-2"
                                        >
                                            <Edit className="size-4" />
                                            Edit Role
                                        </Link>
                                    </MenuItem>
                                    <MenuSeparator />
                                    <MenuItem
                                        onClick={() => setDeleteRole(role)}
                                        variant="destructive"
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete Role
                                    </MenuItem>
                                </MenuGroup>
                            </MenuPopup>
                        </Menu>
                    );
                },
            },
        ],
        [rolesRoutes, filters.sort, filters.direction],
    );

    const table = useReactTable({
        data: filteredRoles,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
        state: {
            sorting,
        },
    });

    return (
        <>
            <Head title="Manage Roles" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'Roles', href: rolesRoutes.index().url },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-semibold">
                                    Roles Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage roles and their permissions
                                </p>
                            </div>
                            <div className="flex max-w-sm flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <div className="hidden sm:order-1 sm:flex sm:max-w-sm sm:flex-1 sm:items-center sm:gap-2">
                                    <InputGroup className="w-full">
                                        <InputGroupInput
                                            aria-label="Search"
                                            placeholder="Search roles..."
                                            type="search"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                        <InputGroupAddon>
                                            {isLoading ? (
                                                <Spinner />
                                            ) : (
                                                <Search className="size-4" />
                                            )}
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                                <div className="hidden sm:order-3 sm:ml-auto sm:flex sm:items-center sm:gap-2">
                                    <ExportDropdown
                                        getExportUrl={(format) => {
                                            const params =
                                                new URLSearchParams();
                                            if (searchQuery)
                                                params.set(
                                                    'search',
                                                    searchQuery,
                                                );
                                            params.set('format', format);
                                            const url =
                                                rolesRoutes.export().url;
                                            return `${url}?${params.toString()}`;
                                        }}
                                        label="Export"
                                    />
                                    <Button
                                        className="hidden sm:inline-flex"
                                        render={
                                            <Link
                                                href={rolesRoutes.create().url}
                                                className="flex items-center"
                                            >
                                                <Plus className="mr-2 size-4" />
                                                Add Role
                                            </Link>
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between lg:hidden">
                                    <div className="flex items-center gap-2">
                                        <Menu>
                                            <MenuTrigger
                                                render={
                                                    <Button variant="outline">
                                                        <Filter className="size-4" />
                                                        <span>Filter</span>
                                                    </Button>
                                                }
                                            />
                                            <MenuPopup
                                                align="end"
                                                className="w-64"
                                            >
                                                <MenuGroup>
                                                    <MenuGroupLabel>
                                                        Search
                                                    </MenuGroupLabel>
                                                    <div className="p-2">
                                                        <InputGroup>
                                                            <InputGroupInput
                                                                aria-label="Search"
                                                                placeholder="Search roles..."
                                                                type="search"
                                                                value={
                                                                    searchQuery
                                                                }
                                                                onChange={(e) =>
                                                                    setSearchQuery(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <InputGroupAddon>
                                                                {isLoading ? (
                                                                    <Spinner />
                                                                ) : (
                                                                    <Search className="size-4" />
                                                                )}
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                    </div>
                                                </MenuGroup>
                                            </MenuPopup>
                                        </Menu>
                                        <Menu>
                                            <MenuTrigger
                                                render={
                                                    <Button variant="outline">
                                                        <Download className="size-4" />
                                                        <span>Export</span>
                                                    </Button>
                                                }
                                            />
                                            <MenuPopup align="end">
                                                <MenuGroup>
                                                    <MenuGroupLabel>
                                                        Export
                                                    </MenuGroupLabel>
                                                    <MenuItem
                                                        onClick={() => {
                                                            const params =
                                                                new URLSearchParams();
                                                            if (searchQuery)
                                                                params.set(
                                                                    'search',
                                                                    searchQuery,
                                                                );
                                                            params.set(
                                                                'format',
                                                                'xlsx',
                                                            );
                                                            window.open(
                                                                `${rolesRoutes.export().url}?${params.toString()}`,
                                                                '_blank',
                                                            );
                                                        }}
                                                    >
                                                        <FileSpreadsheet className="mr-2 size-4" />
                                                        Export to Excel
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            const params =
                                                                new URLSearchParams();
                                                            if (searchQuery)
                                                                params.set(
                                                                    'search',
                                                                    searchQuery,
                                                                );
                                                            params.set(
                                                                'format',
                                                                'csv',
                                                            );
                                                            window.open(
                                                                `${rolesRoutes.export().url}?${params.toString()}`,
                                                                '_blank',
                                                            );
                                                        }}
                                                    >
                                                        <FileText className="mr-2 size-4" />
                                                        Export to CSV
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            const params =
                                                                new URLSearchParams();
                                                            if (searchQuery)
                                                                params.set(
                                                                    'search',
                                                                    searchQuery,
                                                                );
                                                            params.set(
                                                                'format',
                                                                'json',
                                                            );
                                                            window.open(
                                                                `${rolesRoutes.export().url}?${params.toString()}`,
                                                                '_blank',
                                                            );
                                                        }}
                                                    >
                                                        <FileJson className="mr-2 size-4" />
                                                        Export to JSON
                                                    </MenuItem>
                                                </MenuGroup>
                                            </MenuPopup>
                                        </Menu>
                                        <Button
                                            render={
                                                <Link
                                                    href={
                                                        rolesRoutes.create().url
                                                    }
                                                    className="flex items-center"
                                                >
                                                    <Plus className="size-4" />
                                                    Add Role
                                                </Link>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Frame className="w-full">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext(),
                                                                  )}
                                                        </TableHead>
                                                    ),
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={
                                                    row.getIsSelected() &&
                                                    'selected'
                                                }
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No roles found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Frame>

                        <Pagination
                            data={roles}
                            perPage={perPage}
                            onPerPageChange={(value: string) =>
                                setPerPage(value ?? '10')
                            }
                            countLabel="roles"
                            showPageInfo
                        />
                    </div>
                </div>
            </AppLayout>

            <Dialog
                open={!!deleteRole}
                onOpenChange={() => setDeleteRole(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleteRole?.name}?
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
        </>
    );
}
