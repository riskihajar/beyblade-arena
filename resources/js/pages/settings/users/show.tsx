import { Pagination } from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
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
import type { Activity, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Eye,
    Search,
    ShieldCheck,
    ShieldX,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

interface Props {
    user: User;
    activities: PaginatedActivities;
    filters: {
        event?: string;
        date_from?: string;
        date_to?: string;
        per_page?: string | number;
    };
}

interface ActivityProperties {
    attributes?: Record<string, unknown>;
    old?: Record<string, unknown>;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString: string): { date: string; time: string } {
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
}

function getEventBadgeColor(
    description: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
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
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }

    return JSON.stringify(value);
}

function getChanges(properties: Activity['properties']): Array<{
    key: string;
    from: string;
    to: string;
}> {
    if (!properties || typeof properties !== 'object') {
        return [];
    }

    const activityProperties = properties as ActivityProperties;
    const attributes = activityProperties.attributes ?? {};
    const old = activityProperties.old ?? {};
    const keys = Array.from(
        new Set([...Object.keys(attributes), ...Object.keys(old)]),
    );

    return keys.map((key) => ({
        key,
        from: formatValue(old[key]),
        to: formatValue(attributes[key]),
    }));
}

export default function UsersShow({ user, activities, filters }: Props) {
    const { users: usersRoutes, activities: activitiesRoutes } = settings;
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined,
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined,
    );
    const perPage = filters.per_page?.toString() || '10';
    const [isLoading, setIsLoading] = useState(false);

    const createdAt = useMemo(
        () => formatDate(user.created_at),
        [user.created_at],
    );
    const updatedAt = useMemo(
        () => formatDate(user.updated_at),
        [user.updated_at],
    );

    const buildParams = useCallback(() => {
        const params: Record<string, string> = {};

        if (eventFilter) {
            params.event = eventFilter;
        }
        if (dateFrom) {
            params.date_from = format(dateFrom, 'yyyy-MM-dd');
        }
        if (dateTo) {
            params.date_to = format(dateTo, 'yyyy-MM-dd');
        }
        if (perPage && perPage !== '10') {
            params.per_page = perPage;
        }

        return params;
    }, [eventFilter, dateFrom, dateTo, perPage]);

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

        if (
            eventFilter !== (filters.event || '') ||
            stateDateFrom !== (currentFilterDateFrom || undefined) ||
            stateDateTo !== (currentFilterDateTo || undefined) ||
            hasPerPageChanged
        ) {
            const params = buildParams();
            const timeoutId = setTimeout(() => {
                router.get(usersRoutes.show({ user: user.id }).url, params, {
                    preserveState: true,
                    replace: true,
                    onStart: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                });
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [
        eventFilter,
        dateFrom,
        dateTo,
        perPage,
        filters.event,
        filters.date_from,
        filters.date_to,
        activities.per_page,
        usersRoutes,
        buildParams,
        user.id,
    ]);

    return (
        <>
            <Head title="User Details" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'Users', href: usersRoutes.index().url },
                    {
                        title: 'Details',
                        href: usersRoutes.show({ user: user.id }).url,
                    },
                ]}
            >
                <div className="max-w-6xl px-4 py-8">
                    <div className="space-y-6">
                        <Frame>
                            <FrameHeader>
                                <div className="flex flex-wrap items-start gap-4 sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            render={
                                                <Link
                                                    href={
                                                        usersRoutes.index().url
                                                    }
                                                >
                                                    <ArrowLeft className="size-4" />
                                                </Link>
                                            }
                                        />
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-12">
                                                <AvatarImage
                                                    src={
                                                        user.avatar_url ??
                                                        undefined
                                                    }
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="bg-muted text-sm">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <FrameTitle>
                                                    {user.name}
                                                </FrameTitle>
                                                <FrameDescription>
                                                    {user.email}
                                                </FrameDescription>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            render={
                                                <Link
                                                    href={
                                                        usersRoutes.edit({
                                                            user: user.id,
                                                        }).url
                                                    }
                                                >
                                                    Edit User
                                                </Link>
                                            }
                                        />
                                    </div>
                                </div>
                            </FrameHeader>
                            <FramePanel>
                                <div className="space-y-6">
                                    <div className="grid gap-6 lg:grid-cols-3">
                                        <Fieldset className="rounded-lg border p-4 lg:col-span-2">
                                            <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                Overview
                                            </FieldsetLegend>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Status
                                                    </span>
                                                    {user.email_verified_at ? (
                                                        <Badge variant="outline">
                                                            <ShieldCheck className="mr-2 size-3.5 text-emerald-500" />
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            <ShieldX className="mr-2 size-3.5 text-amber-500" />
                                                            Unverified
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Roles
                                                    </span>
                                                    {user.roles &&
                                                    user.roles.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles.map(
                                                                (role) => (
                                                                    <Badge
                                                                        key={
                                                                            role.name
                                                                        }
                                                                        variant="outline"
                                                                    >
                                                                        {role.name
                                                                            .replace(
                                                                                /[-_]/g,
                                                                                ' ',
                                                                            )
                                                                            .replace(
                                                                                /\b\w/g,
                                                                                (
                                                                                    l,
                                                                                ) =>
                                                                                    l.toUpperCase(),
                                                                            )}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            No roles assigned
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Joined
                                                    </span>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="size-3.5" />
                                                        <span>
                                                            {createdAt.date}
                                                        </span>
                                                        <Clock className="size-3.5" />
                                                        <span>
                                                            {createdAt.time}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Updated
                                                    </span>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="size-3.5" />
                                                        <span>
                                                            {updatedAt.date}
                                                        </span>
                                                        <Clock className="size-3.5" />
                                                        <span>
                                                            {updatedAt.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Fieldset>
                                        <Fieldset className="rounded-lg border p-4">
                                            <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                Quick Links
                                            </FieldsetLegend>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <Link
                                                            href={
                                                                usersRoutes.edit(
                                                                    {
                                                                        user: user.id,
                                                                    },
                                                                ).url
                                                            }
                                                        >
                                                            Edit User
                                                        </Link>
                                                    }
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <Link
                                                            href={
                                                                settings.activities.index()
                                                                    .url
                                                            }
                                                        >
                                                            View All Activity
                                                            Logs
                                                        </Link>
                                                    }
                                                />
                                            </div>
                                        </Fieldset>
                                    </div>
                                </div>
                            </FramePanel>
                        </Frame>

                        <Frame>
                            <FrameHeader>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <FrameTitle>
                                            Activity History
                                        </FrameTitle>
                                        <FrameDescription>
                                            Actions involving this user as actor
                                            or target.
                                        </FrameDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Search activity..."
                                                value={eventFilter}
                                                onChange={(e) =>
                                                    setEventFilter(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputGroupAddon>
                                                {isLoading ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <Search className="size-4" />
                                                )}
                                            </InputGroupAddon>
                                        </InputGroup>
                                        <DatePicker
                                            date={dateFrom}
                                            setDate={setDateFrom}
                                            placeholder="From"
                                        />
                                        <DatePicker
                                            date={dateTo}
                                            setDate={setDateTo}
                                            placeholder="To"
                                        />
                                    </div>
                                </div>
                            </FrameHeader>
                            <FramePanel>
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Activity</TableHead>
                                                <TableHead>Scope</TableHead>
                                                <TableHead>Causer</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Changes</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activities.data.length > 0 ? (
                                                activities.data.map(
                                                    (activity) => {
                                                        const createdAt =
                                                            formatDate(
                                                                activity.created_at,
                                                            );
                                                        const changes =
                                                            getChanges(
                                                                activity.properties,
                                                            );
                                                        const isCauser =
                                                            activity.causer_id ===
                                                                user.id &&
                                                            activity.causer_type?.includes(
                                                                'User',
                                                            );
                                                        const isSubject =
                                                            activity.subject_id ===
                                                                user.id &&
                                                            activity.subject_type?.includes(
                                                                'User',
                                                            );

                                                        return (
                                                            <TableRow
                                                                key={
                                                                    activity.id
                                                                }
                                                            >
                                                                <TableCell>
                                                                    <Badge
                                                                        variant={getEventBadgeColor(
                                                                            activity.description,
                                                                        )}
                                                                    >
                                                                        {activity.description
                                                                            .replace(
                                                                                /[-_]/g,
                                                                                ' ',
                                                                            )
                                                                            .replace(
                                                                                /\b\w/g,
                                                                                (
                                                                                    char,
                                                                                ) =>
                                                                                    char.toUpperCase(),
                                                                            )}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {isCauser && (
                                                                            <Badge variant="outline">
                                                                                Actor
                                                                            </Badge>
                                                                        )}
                                                                        {isSubject && (
                                                                            <Badge variant="outline">
                                                                                Target
                                                                            </Badge>
                                                                        )}
                                                                        {!isCauser &&
                                                                            !isSubject && (
                                                                                <Badge variant="outline">
                                                                                    System
                                                                                </Badge>
                                                                            )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium">
                                                                            {activity
                                                                                .causer
                                                                                ?.name ??
                                                                                'System'}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {activity
                                                                                .causer
                                                                                ?.email ??
                                                                                'No email'}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1 text-sm">
                                                                        <span>
                                                                            {
                                                                                createdAt.date
                                                                            }
                                                                        </span>
                                                                        <span className="text-muted-foreground">
                                                                            {
                                                                                createdAt.time
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {changes.length >
                                                                    0 ? (
                                                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                                            {changes
                                                                                .slice(
                                                                                    0,
                                                                                    3,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        change,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                change.key
                                                                                            }
                                                                                            className="flex flex-wrap items-center gap-1"
                                                                                        >
                                                                                            <span className="font-medium text-foreground">
                                                                                                {
                                                                                                    change.key
                                                                                                }

                                                                                                :
                                                                                            </span>
                                                                                            <span>
                                                                                                {
                                                                                                    change.from
                                                                                                }
                                                                                            </span>
                                                                                            <span>
                                                                                                →
                                                                                            </span>
                                                                                            <span>
                                                                                                {
                                                                                                    change.to
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            {changes.length >
                                                                                3 && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    +
                                                                                    {changes.length -
                                                                                        3}{' '}
                                                                                    more
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            No
                                                                            changes
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        render={
                                                                            <Link
                                                                                href={
                                                                                    activitiesRoutes.show(
                                                                                        {
                                                                                            activity:
                                                                                                activity.id,
                                                                                        },
                                                                                    )
                                                                                        .url
                                                                                }
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                <Eye className="size-4" />
                                                                                Details
                                                                            </Link>
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="h-24 text-center"
                                                    >
                                                        No activity history
                                                        found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    <Pagination
                                        data={activities}
                                        showPerPage={false}
                                        countLabel="activities"
                                        showPageInfo
                                    />
                                </div>
                            </FramePanel>
                        </Frame>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
