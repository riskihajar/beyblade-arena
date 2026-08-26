import { AsyncUserCombobox } from '@/components/async-user-combobox';
import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import { Head, Link, router } from '@inertiajs/react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    Filter,
    Search,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Activity {
    id: string;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: string | null;
    causer_type: string | null;
    causer_id: string | null;
    causer: {
        id: string;
        name: string;
        email: string;
        avatar_url?: string | null;
    } | null;
    properties: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

interface PaginatedActivities {
    data: Activity[];
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

interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    activities: PaginatedActivities;
    logTypes: SelectOption[];
    selectedUser: SelectOption[];
    filters: {
        filter?: string;
        event?: string;
        user_id?: string | string[];
        date_from?: string;
        date_to?: string;
        per_page?: string | number;
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

export default function ActivitiesIndex({
    activities,
    logTypes,
    selectedUser,
    filters,
}: Props) {
    const { activities: activitiesRoutes } = settings;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [logFilter, setLogFilter] = useState(filters.filter || 'all');
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [userIdFilter, setUserIdFilter] = useState<string[]>(() => {
        const userId = filters.user_id;
        if (!userId) return [];
        return Array.isArray(userId) ? userId : [userId];
    });
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined,
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined,
    );
    const [perPage, setPerPage] = useState(
        filters.per_page?.toString() || '10',
    );
    const [isLoading, setIsLoading] = useState(false);

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
        const params: Record<string, string | string[]> = {};

        if (logFilter && logFilter !== 'all') {
            params.filter = logFilter;
        }
        if (eventFilter) {
            params.event = eventFilter;
        }
        if (userIdFilter.length > 0) {
            params.user_id = userIdFilter;
        }
        if (dateFrom) {
            params.date_from = format(dateFrom, 'yyyy-MM-dd');
        }
        if (dateTo) {
            params.date_to = format(dateTo, 'yyyy-MM-dd');
        }
        if (perPage) {
            params.per_page = perPage;
        }
        if (sorting.length > 0) {
            params.sort = sorting[0].id;
            params.direction = sorting[0].desc ? 'desc' : 'asc';
            params.page = activities.current_page.toString();
        }

        return params;
    }, [
        logFilter,
        eventFilter,
        userIdFilter,
        dateFrom,
        dateTo,
        perPage,
        sorting,
        activities.current_page,
    ]);

    useEffect(() => {
        const currentPerPage = activities.per_page?.toString() ?? '10';
        const hasPerPageChanged = perPage !== currentPerPage;

        const currentFilterDateFrom = filters.date_from
            ? new Date(filters.date_from).toISOString().split('T')[0]
            : undefined;
        const stateDateFrom = dateFrom
            ? format(dateFrom, 'yyyy-MM-dd')
            : undefined;

        const currentFilterDateTo = filters.date_to
            ? new Date(filters.date_to).toISOString().split('T')[0]
            : undefined;
        const stateDateTo = dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined;

        // Compare user_id arrays
        const filterUserIds = (() => {
            const userId = filters.user_id;
            if (!userId) return [];
            return Array.isArray(userId) ? userId : [userId];
        })();
        const userIdChanged =
            userIdFilter.length !== filterUserIds.length ||
            !userIdFilter.every((id) => filterUserIds.includes(id));

        if (
            logFilter !== (filters.filter || 'all') ||
            eventFilter !== (filters.event || '') ||
            userIdChanged ||
            stateDateFrom !== (currentFilterDateFrom || undefined) ||
            stateDateTo !== (currentFilterDateTo || undefined) ||
            hasPerPageChanged
        ) {
            const params = buildParams();
            // Reset to page 1 when filtering
            delete params.page;

            // Debounce for text inputs (event filter)
            const timeoutId = setTimeout(() => {
                router.get(activitiesRoutes.index().url, params, {
                    preserveState: true,
                    replace: true,
                    onStart: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                });
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [
        logFilter,
        eventFilter,
        userIdFilter,
        dateFrom,
        dateTo,
        perPage,
        filters.filter,
        filters.event,
        filters.user_id,
        filters.date_from,
        filters.date_to,
        activities.per_page,
        activitiesRoutes,
        buildParams,
    ]);

    useEffect(() => {
        if (sorting.length > 0) {
            const params = buildParams();
            router.get(activitiesRoutes.index().url, params, {
                preserveState: true,
                replace: true,
            });
        }
    }, [sorting, buildParams, activitiesRoutes]);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
        };
    }, []);

    const getEventBadgeColor = useCallback((description: string) => {
        const desc = description.toLowerCase();
        if (desc.includes('create') || desc.includes('created')) {
            return 'default';
        }
        if (
            desc.includes('update') ||
            desc.includes('updated') ||
            desc.includes('edit')
        ) {
            return 'secondary';
        }
        if (desc.includes('delete') || desc.includes('deleted')) {
            return 'destructive';
        }
        if (desc.includes('login') || desc.includes('logged')) {
            return 'outline';
        }
        return 'outline';
    }, []);

    const columns = useMemo<ColumnDef<Activity>[]>(
        () => [
            {
                accessorKey: 'causer',
                header: ({ column }) => (
                    <TableColumnHeader column={column} title="User" />
                ),
                cell: ({ row }) => {
                    const activity = row.original;
                    const causer = activity.causer;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                                <AvatarImage
                                    src={causer?.avatar_url ?? undefined}
                                    alt={causer?.name ?? 'Unknown'}
                                />
                                <AvatarFallback className="bg-muted text-xs">
                                    {causer?.name
                                        ? getInitials(causer.name)
                                        : '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {causer?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {causer?.email || 'N/A'}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'description',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Activity"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const activity = row.original;
                    return (
                        <Badge
                            variant={getEventBadgeColor(activity.description)}
                        >
                            {activity.description
                                .replace(/[-_]/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'log_name',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Log Type"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const activity = row.original;
                    const logName = activity.log_name || 'default';
                    return (
                        <span className="text-sm">
                            {logName
                                .replace(/[-_]/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'subject_type',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Target"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const activity = row.original;
                    const subjectType = activity.subject_type;
                    if (!subjectType) {
                        return (
                            <span className="text-sm text-muted-foreground">
                                N/A
                            </span>
                        );
                    }
                    const type = subjectType.split('\\').pop();
                    return (
                        <span className="text-sm">{type || subjectType}</span>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <TableColumnHeader
                        column={column}
                        title="Date & Time"
                        sort={filters.sort ?? null}
                        direction={filters.direction ?? null}
                    />
                ),
                cell: ({ row }) => {
                    const activity = row.original;
                    const { date, time } = formatDate(activity.created_at);
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="size-3.5 text-muted-foreground" />
                                <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="size-3.5" />
                                <span>{time}</span>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const activity = row.original;
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            render={
                                <Link
                                    href={
                                        activitiesRoutes.show({
                                            activity: activity.id,
                                        }).url
                                    }
                                    className="flex items-center gap-2"
                                >
                                    View Details
                                </Link>
                            }
                        />
                    );
                },
            },
        ],
        [
            getEventBadgeColor,
            formatDate,
            activitiesRoutes,
            filters.sort,
            filters.direction,
        ],
    );

    const table = useReactTable({
        data: activities.data,
        columns,
        getRowId: (row) => row.id,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting: true,
        state: {
            sorting,
            columnFilters,
        },
    });

    const resetFilters = () => {
        setLogFilter('all');
        setEventFilter('');
        setUserIdFilter([]);
        setDateFrom(undefined);
        setDateTo(undefined);
    };

    const hasActiveFilters =
        logFilter !== 'all' ||
        eventFilter !== '' ||
        userIdFilter.length > 0 ||
        dateFrom !== undefined ||
        dateTo !== undefined;

    return (
        <>
            <Head title="Activity Logs" />
            <AppLayout
                breadcrumbs={[
                    {
                        title: 'Settings',
                        href: settings.activities.index().url,
                    },
                    { title: 'Activities', href: activitiesRoutes.index().url },
                ]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-semibold">
                                    Activity Logs
                                </h1>
                                <p className="text-muted-foreground">
                                    View and monitor system activity
                                </p>
                            </div>

                            <div className="flex max-w-sm flex-1 flex-col gap-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex-1">
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Search by event description..."
                                                value={eventFilter}
                                                onChange={(e) =>
                                                    setEventFilter(
                                                        e.target.value,
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
                                    <div className="flex items-center gap-2">
                                        <Menu>
                                            <MenuTrigger
                                                render={
                                                    <Button variant="outline">
                                                        <Filter className="mr-2 size-4" />
                                                        Filter
                                                        {hasActiveFilters && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-2 rounded-sm px-1 font-normal lg:hidden"
                                                            >
                                                                •
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                }
                                            />
                                            <MenuPopup
                                                align="end"
                                                className="w-80"
                                            >
                                                <MenuGroup>
                                                    <MenuGroupLabel>
                                                        Filter Activities
                                                    </MenuGroupLabel>
                                                    <div className="space-y-4 p-3">
                                                        <div className="space-y-2">
                                                            <span className="text-sm leading-none font-medium">
                                                                Log Type
                                                            </span>
                                                            <Select
                                                                value={
                                                                    logFilter
                                                                }
                                                                onValueChange={(
                                                                    val,
                                                                ) =>
                                                                    setLogFilter(
                                                                        val ||
                                                                            'all',
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue>
                                                                        {logTypes.find(
                                                                            (
                                                                                t,
                                                                            ) =>
                                                                                t.value ===
                                                                                logFilter,
                                                                        )
                                                                            ?.label ??
                                                                            'All Logs'}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {logTypes.map(
                                                                        (
                                                                            type,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    type.value
                                                                                }
                                                                                value={
                                                                                    type.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    type.label
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <span className="text-sm leading-none font-medium">
                                                                User
                                                            </span>
                                                            <AsyncUserCombobox
                                                                value={
                                                                    userIdFilter
                                                                }
                                                                onValueChange={
                                                                    setUserIdFilter
                                                                }
                                                                defaultItems={
                                                                    selectedUser
                                                                }
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <span className="text-sm leading-none font-medium">
                                                                From
                                                            </span>
                                                            <DatePicker
                                                                date={dateFrom}
                                                                setDate={
                                                                    setDateFrom
                                                                }
                                                                placeholder="Pick date"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <span className="text-sm leading-none font-medium">
                                                                To
                                                            </span>
                                                            <DatePicker
                                                                date={dateTo}
                                                                setDate={
                                                                    setDateTo
                                                                }
                                                                placeholder="Pick date"
                                                            />
                                                        </div>

                                                        {hasActiveFilters && (
                                                            <>
                                                                <MenuSeparator />
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={
                                                                        resetFilters
                                                                    }
                                                                    className="w-full justify-start text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    Reset
                                                                    Filters
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </MenuGroup>
                                            </MenuPopup>
                                        </Menu>
                                        <Menu>
                                            <MenuTrigger
                                                render={
                                                    <Button variant="outline">
                                                        <Download className="size-4" />
                                                        <span className="ml-2 hidden sm:inline">
                                                            Export
                                                        </span>
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
                                                            if (
                                                                logFilter &&
                                                                logFilter !==
                                                                    'all'
                                                            ) {
                                                                params.set(
                                                                    'filter',
                                                                    logFilter,
                                                                );
                                                            }
                                                            if (eventFilter) {
                                                                params.set(
                                                                    'event',
                                                                    eventFilter,
                                                                );
                                                            }
                                                            if (
                                                                userIdFilter.length >
                                                                0
                                                            ) {
                                                                userIdFilter.forEach(
                                                                    (
                                                                        userId,
                                                                    ) => {
                                                                        params.append(
                                                                            'user_id',
                                                                            userId,
                                                                        );
                                                                    },
                                                                );
                                                            }
                                                            if (dateFrom) {
                                                                params.set(
                                                                    'date_from',
                                                                    format(
                                                                        dateFrom,
                                                                        'yyyy-MM-dd',
                                                                    ),
                                                                );
                                                            }
                                                            if (dateTo) {
                                                                params.set(
                                                                    'date_to',
                                                                    format(
                                                                        dateTo,
                                                                        'yyyy-MM-dd',
                                                                    ),
                                                                );
                                                            }
                                                            if (
                                                                sorting.length >
                                                                0
                                                            ) {
                                                                params.set(
                                                                    'sort',
                                                                    sorting[0]
                                                                        .id,
                                                                );
                                                                params.set(
                                                                    'direction',
                                                                    sorting[0]
                                                                        .desc
                                                                        ? 'desc'
                                                                        : 'asc',
                                                                );
                                                            }
                                                            params.set(
                                                                'format',
                                                                'xlsx',
                                                            );
                                                            window.open(
                                                                `${activitiesRoutes.export().url}?${params.toString()}`,
                                                                '_blank',
                                                            );
                                                        }}
                                                    >
                                                        <FileSpreadsheet className="mr-2 size-4" />
                                                        Excel (.xlsx)
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            const params =
                                                                new URLSearchParams();
                                                            if (
                                                                logFilter &&
                                                                logFilter !==
                                                                    'all'
                                                            ) {
                                                                params.set(
                                                                    'filter',
                                                                    logFilter,
                                                                );
                                                            }
                                                            if (eventFilter) {
                                                                params.set(
                                                                    'event',
                                                                    eventFilter,
                                                                );
                                                            }
                                                            if (
                                                                userIdFilter.length >
                                                                0
                                                            ) {
                                                                userIdFilter.forEach(
                                                                    (
                                                                        userId,
                                                                    ) => {
                                                                        params.append(
                                                                            'user_id',
                                                                            userId,
                                                                        );
                                                                    },
                                                                );
                                                            }
                                                            if (dateFrom) {
                                                                params.set(
                                                                    'date_from',
                                                                    format(
                                                                        dateFrom,
                                                                        'yyyy-MM-dd',
                                                                    ),
                                                                );
                                                            }
                                                            if (dateTo) {
                                                                params.set(
                                                                    'date_to',
                                                                    format(
                                                                        dateTo,
                                                                        'yyyy-MM-dd',
                                                                    ),
                                                                );
                                                            }
                                                            if (
                                                                sorting.length >
                                                                0
                                                            ) {
                                                                params.set(
                                                                    'sort',
                                                                    sorting[0]
                                                                        .id,
                                                                );
                                                                params.set(
                                                                    'direction',
                                                                    sorting[0]
                                                                        .desc
                                                                        ? 'desc'
                                                                        : 'asc',
                                                                );
                                                            }
                                                            params.set(
                                                                'format',
                                                                'csv',
                                                            );
                                                            window.open(
                                                                `${activitiesRoutes.export().url}?${params.toString()}`,
                                                                '_blank',
                                                            );
                                                        }}
                                                    >
                                                        <FileText className="mr-2 size-4" />
                                                        CSV (.csv)
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            const params =
                                                                new URLSearchParams();
                                                            if (
                                                                logFilter &&
                                                                logFilter !==
                                                                    'all'
                                                            ) {
                                                                params.set(
                                                                    'filter',
                                                                    logFilter,
                                                                );
                                                            }
                                                            if (eventFilter) {
                                                                params.set(
                                                                    'event',
                                                                    eventFilter,
                                                                );
                                                            }
                                                            if (
                                                                userIdFilter.length >
                                                                0
                                                            ) {
                                                                userIdFilter.forEach(
                                                                    (
                                                                        userId,
                                                                    ) => {
                                                                        params.append(
                                                                            'user_id',
                                                                            userId,
                                                                        );
                                                                    },
                                                                );
                                                            }
                                                            if (dateFrom) {
                                                                params.set(
                                                                    'date_from',
                                                                    format(
                                                                        dateFrom,
                                                                        'yyyy-MM-dd',
                                                                    ),
                                                                );
                                                            }
                                                            if (dateTo) {
                                                                params.set(
                                                                    'date_to',
                                                                    format(
                                                                        dateTo,
                                                                        'yyyy-MM-dd',
                                                                    ),
                                                                );
                                                            }
                                                            if (
                                                                sorting.length >
                                                                0
                                                            ) {
                                                                params.set(
                                                                    'sort',
                                                                    sorting[0]
                                                                        .id,
                                                                );
                                                                params.set(
                                                                    'direction',
                                                                    sorting[0]
                                                                        .desc
                                                                        ? 'desc'
                                                                        : 'asc',
                                                                );
                                                            }
                                                            params.set(
                                                                'format',
                                                                'json',
                                                            );
                                                            window.open(
                                                                `${activitiesRoutes.export().url}?${params.toString()}`,
                                                                '_blank',
                                                            );
                                                        }}
                                                    >
                                                        <FileJson className="mr-2 size-4" />
                                                        JSON (.json)
                                                    </MenuItem>
                                                </MenuGroup>
                                            </MenuPopup>
                                        </Menu>
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
                                                No activities found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Frame>

                        <Pagination
                            data={activities}
                            perPage={perPage}
                            onPerPageChange={(value: string) =>
                                setPerPage(value || '10')
                            }
                            countLabel="activities"
                            perPageOptions={['10', '20', '50', '100']}
                        />
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
