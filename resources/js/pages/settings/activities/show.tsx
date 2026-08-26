import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Hash, Mail, User } from 'lucide-react';

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

interface Props {
    activity: Activity;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
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

export default function ActivityShow({ activity }: Props) {
    const { activities: activitiesRoutes } = settings;
    const causer = activity.causer;
    const subjectType = activity.subject_type?.split('\\').pop() ?? null;
    const createdAt = formatDate(activity.created_at);
    const updatedAt = formatDate(activity.updated_at);
    const properties = activity.properties ?? {};
    const hasProperties = Object.keys(properties).length > 0;

    return (
        <>
            <Head title="Activity Details" />
            <AppLayout
                breadcrumbs={[
                    {
                        title: 'Settings',
                        href: settings.activities.index().url,
                    },
                    { title: 'Activities', href: activitiesRoutes.index().url },
                    {
                        title: 'Details',
                        href: activitiesRoutes.show({ activity: activity.id })
                            .url,
                    },
                ]}
            >
                <div className="max-w-5xl px-4 py-8">
                    <Frame>
                        <FrameHeader>
                            <div className="flex flex-wrap items-start gap-3 sm:items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    render={
                                        <Link
                                            href={activitiesRoutes.index().url}
                                        >
                                            <ArrowLeft className="size-4" />
                                        </Link>
                                    }
                                />
                                <div className="min-w-0 space-y-1">
                                    <FrameTitle>Activity Details</FrameTitle>
                                    <FrameDescription>
                                        Review the full record for this activity
                                        log.
                                    </FrameDescription>
                                </div>
                                <Badge
                                    className="shrink-0"
                                    variant={getEventBadgeColor(
                                        activity.description,
                                    )}
                                >
                                    {activity.description
                                        .replace(/[-_]/g, ' ')
                                        .replace(/\b\w/g, (char) =>
                                            char.toUpperCase(),
                                        )}
                                </Badge>
                            </div>
                        </FrameHeader>
                        <FramePanel>
                            <div className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <div className="min-w-0 space-y-6 lg:col-span-2">
                                        <Fieldset className="rounded-lg border p-4">
                                            <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                Summary
                                            </FieldsetLegend>
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                                    Activity ID
                                                </span>
                                                <span className="text-sm font-medium break-all">
                                                    {activity.id}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Log Type
                                                    </span>
                                                    <p className="text-sm font-medium">
                                                        {activity.log_name ||
                                                            'default'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Target Type
                                                    </span>
                                                    <p className="text-sm font-medium">
                                                        {subjectType ?? 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Target ID
                                                    </span>
                                                    <p className="text-sm font-medium break-all">
                                                        {activity.subject_id ??
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">
                                                        Causer Type
                                                    </span>
                                                    <p className="text-sm font-medium">
                                                        {activity.causer_type ??
                                                            'System'}
                                                    </p>
                                                </div>
                                            </div>
                                        </Fieldset>

                                        <Fieldset className="min-w-0 rounded-lg border p-4">
                                            <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                Properties
                                            </FieldsetLegend>
                                            {hasProperties ? (
                                                <pre className="max-h-[320px] max-w-full overflow-x-auto overflow-y-auto rounded-lg border border-border bg-muted/40 p-4 text-xs whitespace-pre text-muted-foreground">
                                                    {JSON.stringify(
                                                        properties,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No additional properties
                                                    recorded.
                                                </p>
                                            )}
                                        </Fieldset>
                                    </div>

                                    <div className="space-y-6">
                                        <Fieldset className="rounded-lg border p-4">
                                            <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                User
                                            </FieldsetLegend>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-10">
                                                    <AvatarImage
                                                        src={
                                                            causer?.avatar_url ??
                                                            undefined
                                                        }
                                                        alt={
                                                            causer?.name ??
                                                            'System'
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-muted text-xs">
                                                        {causer?.name
                                                            ? getInitials(
                                                                  causer.name,
                                                              )
                                                            : 'SYS'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {causer?.name ??
                                                            'System'}
                                                    </span>
                                                    <span className="text-xs break-all text-muted-foreground">
                                                        {causer?.email ??
                                                            'No email'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <User className="size-4" />
                                                    <span className="break-all">
                                                        {activity.causer_id ??
                                                            'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="size-4" />
                                                    <span className="break-all">
                                                        {causer?.email ?? 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Fieldset>

                                        <Fieldset className="rounded-lg border p-4">
                                            <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                Timeline
                                            </FieldsetLegend>
                                            <div className="space-y-3 text-sm">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="size-4" />
                                                        <span>
                                                            {createdAt.date}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="size-4" />
                                                        <span>
                                                            {createdAt.time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Hash className="size-4" />
                                                        <span>Created</span>
                                                    </div>
                                                </div>
                                                <div className="border-t border-border pt-3">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="size-4" />
                                                        <span>
                                                            {updatedAt.date}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="size-4" />
                                                        <span>
                                                            {updatedAt.time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Hash className="size-4" />
                                                        <span>
                                                            Last Updated
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Fieldset>
                                    </div>
                                </div>
                            </div>
                        </FramePanel>
                    </Frame>
                </div>
            </AppLayout>
        </>
    );
}
