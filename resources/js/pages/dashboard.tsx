import RoleDistributionChart from '@/components/charts/RoleDistributionChart';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { User } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, ShieldCheck, Users } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    total_users: number;
    active_sessions: number;
    verified_users: number;
    unverified_users: number;
    total_roles: number;
    new_users_today: number;
    new_users_week: number;
    new_users_month: number;
    admin_users: number;
}

interface Props {
    stats: Stats;
    recentUsers: User[];
    userGrowthData: { date: string; count: number }[];
    roleDistribution: { name: string; count: number }[];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function Dashboard({
    stats,
    recentUsers,
    userGrowthData,
    roleDistribution,
}: Props) {
    const statsCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            color: 'text-blue-500',
            description: `${stats.new_users_today} new today`,
        },
        {
            title: 'Active Sessions',
            value: stats.active_sessions,
            icon: Activity,
            color: 'text-green-500',
            description: 'Last 30 minutes',
        },
        {
            title: 'Verified Users',
            value: stats.verified_users,
            icon: ShieldCheck,
            color: 'text-emerald-500',
            description: `${stats.unverified_users} unverified`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {statsCards.map((card) => (
                        <Frame key={card.title}>
                            <div className="flex items-center justify-between">
                                <FrameHeader>
                                    <FrameTitle>{card.title}</FrameTitle>
                                    <FrameDescription>
                                        {card.description}
                                    </FrameDescription>
                                </FrameHeader>
                                <div className="px-5 py-4">
                                    <card.icon
                                        className={cn(card.color, 'size-9')}
                                    />
                                </div>
                            </div>
                            <FramePanel>
                                <div className="text-3xl font-bold">
                                    {card.value}
                                </div>
                            </FramePanel>
                        </Frame>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <UserGrowthChart data={userGrowthData} />
                    <RoleDistributionChart data={roleDistribution} />
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold">Recent Users</h2>
                        <p className="text-sm text-muted-foreground">
                            Latest users registered to the platform
                        </p>
                    </div>

                    <Frame className="w-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage
                                                        src={
                                                            user.avatar as
                                                                | string
                                                                | undefined
                                                        }
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
                                        </TableCell>
                                        <TableCell>
                                            {user.roles &&
                                            user.roles.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role.id}
                                                            variant="outline"
                                                        >
                                                            {role.name
                                                                .replace(
                                                                    /[-_]/g,
                                                                    ' ',
                                                                )
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (l) =>
                                                                        l.toUpperCase(),
                                                                )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    No role
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.email_verified_at ? (
                                                <Badge variant="outline">
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-1.5 rounded-full bg-emerald-500"
                                                    />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-1.5 rounded-full bg-amber-500"
                                                    />
                                                    Unverified
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Frame>
                </div>
            </div>
        </AppLayout>
    );
}
