import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import type { Role, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Download,
    Edit,
    Eye,
    FileJson,
    FileSpreadsheet,
    FileText,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    ShieldCheck,
    ShieldX,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface PaginatedUsers {
    data: User[];
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
    users: PaginatedUsers;
    filters: {
        search?: string;
        status?: string;
        per_page?: string;
        sort?: string;
        direction?: string;
    };
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function UsersIndex({ users, filters }: Props) {
    const { users: usersRoutes } = settings;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(
        filters.per_page?.toString() || '10',
    );
    const [isLoading, setIsLoading] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [bulkDelete, setBulkDelete] = useState(false);
    const [verifyUser, setVerifyUser] = useState<User | null>(null);
    const [unverifyUser, setUnverifyUser] = useState<User | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentPerPage = users.per_page?.toString() ?? '10';
            const hasSearchChanged = searchQuery !== (filters.search || '');
            const hasStatusChanged = statusFilter !== (filters.status || 'all');
            const hasPerPageChanged = perPage !== currentPerPage;

            if (hasSearchChanged || hasStatusChanged || hasPerPageChanged) {
                const params: Record<string, string> = {};
                if (searchQuery) {
                    params.search = searchQuery;
                }
                if (statusFilter && statusFilter !== 'all') {
                    params.status = statusFilter;
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

                router.get(usersRoutes.index().url, params, {
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
        statusFilter,
        perPage,
        filters.search,
        filters.status,
        users.per_page,
        usersRoutes,
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
        if (statusFilter && statusFilter !== 'all')
            params.status = statusFilter;
        if (perPage && perPage !== '10')
            params.per_page = parseInt(perPage, 10);
        if (sorting.length > 0) {
            params.sort = sorting[0].id;
            params.direction = sorting[0].desc ? 'desc' : 'asc';
            params.page = users.current_page;
        }

        return params;
    }, [searchQuery, statusFilter, perPage, sorting, users.current_page]);

    useEffect(() => {
        if (sorting.length > 0) {
            router.get(usersRoutes.index().url, buildParams(), {
                preserveState: true,
                replace: true,
            });
        }
    }, [sorting, usersRoutes, buildParams]);

    const handleDelete = useCallback(
        (userId: string) => {
            router.delete(usersRoutes.destroy({ user: userId }).url);
        },
        [usersRoutes],
    );

    const handleBulkDelete = useCallback(() => {
        const selectedIds = Object.keys(rowSelection);
        router.delete(usersRoutes.bulkDestroy().url, {
            data: { ids: selectedIds },
            onSuccess: () => {
                setRowSelection({});
                setBulkDelete(false);
            },
        });
    }, [rowSelection, usersRoutes]);

    const confirmDelete = useCallback(() => {
        if (deleteUser) {
            handleDelete(deleteUser.id);
            setDeleteUser(null);
        }
    }, [deleteUser, handleDelete]);

    const handleVerify = useCallback(
        (userId: string) => {
            router.patch(usersRoutes.verify({ user: userId }).url);
        },
        [usersRoutes],
    );

    const confirmVerify = useCallback(() => {
        if (verifyUser) {
            handleVerify(verifyUser.id);
            setVerifyUser(null);
        }
    }, [verifyUser, handleVerify]);

    const handleUnverify = useCallback(
        (userId: string) => {
            router.patch(usersRoutes.unverify({ user: userId }).url);
        },
        [usersRoutes],
    );

    const confirmUnverify = useCallback(() => {
        if (unverifyUser) {
            handleUnverify(unverifyUser.id);
            setUnverifyUser(null);
        }
    }, [unverifyUser, handleUnverify]);

    const filteredUsers = useMemo(() => {
        return users.data;
    }, [users.data]);

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={table.getIsSomePageRowsSelected()}
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="User"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                                <AvatarImage
                                    src={user.avatar_url || ''}
                                    alt={user.name}
                                />

                                <AvatarFallback className="bg-muted text-xs">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {user.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'roles',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Roles"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const user = row.original;
                    if (user.roles && user.roles.length > 0) {
                        return (
                            <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                    <Badge key={role.name} variant="outline">
                                        {role.name
                                            .replace(/[-_]/g, ' ')
                                            .replace(/\b\w/g, (l) =>
                                                l.toUpperCase(),
                                            )}
                                    </Badge>
                                ))}
                            </div>
                        );
                    }
                    return (
                        <span className="text-sm text-muted-foreground">
                            No role
                        </span>
                    );
                },
                filterFn: (row, id, value) => {
                    const roles = row.getValue(id) as Role[];
                    if (value === 'all') return true;
                    return roles?.some(
                        (r) => r.name.toLowerCase() === value.toLowerCase(),
                    );
                },
            },
            {
                accessorKey: 'email_verified_at',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Status"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const user = row.original;
                    if (user.email_verified_at) {
                        return (
                            <Badge variant="outline">
                                <span
                                    aria-hidden="true"
                                    className="size-1.5 rounded-full bg-emerald-500"
                                />
                                Verified
                            </Badge>
                        );
                    }
                    return (
                        <Badge variant="outline">
                            <span
                                aria-hidden="true"
                                className="size-1.5 rounded-full bg-amber-500"
                            />
                            Unverified
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Joined"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {new Date(
                            row.getValue('created_at'),
                        ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                ),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const user = row.original;
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
                                                usersRoutes.show({
                                                    user: user.id,
                                                }).url
                                            }
                                            className="flex w-full items-center gap-2"
                                        >
                                            <Eye className="size-4" />
                                            View Details
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <Link
                                            href={
                                                usersRoutes.edit({
                                                    user: user.id,
                                                }).url
                                            }
                                            className="flex w-full items-center gap-2"
                                        >
                                            <Edit className="size-4" />
                                            Edit User
                                        </Link>
                                    </MenuItem>
                                    {user.email_verified_at ? (
                                        <MenuItem
                                            onClick={() =>
                                                setUnverifyUser(user)
                                            }
                                        >
                                            <ShieldX className="mr-2 size-4" />
                                            Mark as Unverified
                                        </MenuItem>
                                    ) : (
                                        <MenuItem
                                            onClick={() => setVerifyUser(user)}
                                        >
                                            <ShieldCheck className="mr-2 size-4" />
                                            Mark as Verified
                                        </MenuItem>
                                    )}
                                    <MenuSeparator />
                                    <MenuItem
                                        onClick={() => setDeleteUser(user)}
                                        variant="destructive"
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete User
                                    </MenuItem>
                                </MenuGroup>
                            </MenuPopup>
                        </Menu>
                    );
                },
            },
        ],
        [usersRoutes, filters.sort, filters.direction],
    );

    const table = useReactTable({
        data: filteredUsers,
        columns,
        getRowId: (row) => row.id,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting: true,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    });

    return (
        <>
            <Head title="Manage Users" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'Users', href: usersRoutes.index().url },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-semibold">
                                    Users Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage user accounts, roles, and permissions
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                {Object.keys(rowSelection).length > 0 && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setBulkDelete(true)}
                                        className="sm:order-2"
                                    >
                                        <Trash2 className="size-4" />
                                        <span className="ml-2 hidden sm:inline">
                                            Delete (
                                            {Object.keys(rowSelection).length})
                                        </span>
                                    </Button>
                                )}
                                <div className="flex items-center justify-between">
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
                                                        Search &amp; Filter
                                                    </MenuGroupLabel>
                                                    <div className="p-2">
                                                        <InputGroup>
                                                            <InputGroupInput
                                                                aria-label="Search"
                                                                placeholder="Search users..."
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
                                                                onKeyDown={(
                                                                    e,
                                                                ) => {
                                                                    // Prevent menu keyboard navigation from interfering with typing
                                                                    if (
                                                                        e.key !==
                                                                        'Escape'
                                                                    ) {
                                                                        e.stopPropagation();
                                                                    }
                                                                }}
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
                                                    <div className="px-2 pb-2">
                                                        <Select
                                                            value={statusFilter}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setStatusFilter(
                                                                    value as string,
                                                                )
                                                            }
                                                            itemToStringLabel={(
                                                                value,
                                                            ) => {
                                                                const labels: Record<
                                                                    string,
                                                                    string
                                                                > = {
                                                                    all: 'All Status',
                                                                    verified:
                                                                        'Verified',
                                                                    unverified:
                                                                        'Unverified',
                                                                };
                                                                return (
                                                                    labels[
                                                                        value as string
                                                                    ] ||
                                                                    (value as string)
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">
                                                                    All Status
                                                                </SelectItem>
                                                                <SelectItem value="verified">
                                                                    Verified
                                                                </SelectItem>
                                                                <SelectItem value="unverified">
                                                                    Unverified
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
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
                                                            if (
                                                                statusFilter &&
                                                                statusFilter !==
                                                                    'all'
                                                            ) {
                                                                params.set(
                                                                    'status',
                                                                    statusFilter,
                                                                );
                                                            }
                                                            params.set(
                                                                'format',
                                                                'xlsx',
                                                            );
                                                            window.open(
                                                                `${usersRoutes.export().url}?${params.toString()}`,
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
                                                            if (
                                                                statusFilter &&
                                                                statusFilter !==
                                                                    'all'
                                                            ) {
                                                                params.set(
                                                                    'status',
                                                                    statusFilter,
                                                                );
                                                            }
                                                            params.set(
                                                                'format',
                                                                'csv',
                                                            );
                                                            window.open(
                                                                `${usersRoutes.export().url}?${params.toString()}`,
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
                                                            if (
                                                                statusFilter &&
                                                                statusFilter !==
                                                                    'all'
                                                            ) {
                                                                params.set(
                                                                    'status',
                                                                    statusFilter,
                                                                );
                                                            }
                                                            params.set(
                                                                'format',
                                                                'json',
                                                            );
                                                            window.open(
                                                                `${usersRoutes.export().url}?${params.toString()}`,
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
                                                        usersRoutes.create().url
                                                    }
                                                    className="flex items-center"
                                                >
                                                    <Plus className="size-4" />
                                                    Add User
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
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Frame>

                        <Pagination
                            data={users}
                            perPage={perPage}
                            onPerPageChange={(value: string) =>
                                setPerPage(value || '10')
                            }
                            countLabel="users"
                            showPageInfo
                        />
                    </div>
                </div>
            </AppLayout>

            <Dialog
                open={!!deleteUser}
                onOpenChange={() => setDeleteUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleteUser?.name}?
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

            <Dialog open={bulkDelete} onOpenChange={setBulkDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Users</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            {Object.keys(rowSelection).length} selected users?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!verifyUser}
                onOpenChange={() => setVerifyUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify User Email</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark {verifyUser?.name}
                            &apos;s email as verified?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button onClick={confirmVerify}>Verify</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!unverifyUser}
                onOpenChange={() => setUnverifyUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unverify User Email</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark {unverifyUser?.name}
                            &apos;s email as unverified? The user will need to
                            verify their email again.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button variant="destructive" onClick={confirmUnverify}>
                            Unverify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
