import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Frame } from '@/components/ui/frame';
import { Pagination } from '@/components/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    create,
    index as eventsIndex,
    show as showEvent,
} from '@/routes/admin/events';
import { type BreadcrumbItem } from '@/types';
import { type Event } from '@/types/tournament';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, MapPin, Plus, Trophy, Users } from 'lucide-react';

interface PaginatedEvents {
    data: Event[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    events: PaginatedEvents;
    filters: {
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Turnamen & Event', href: eventsIndex().url },
];

function getStatusBadgeVariant(
    status: string,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
        case 'registration_open':
            return 'default';
        case 'ongoing':
            return 'secondary';
        case 'completed':
            return 'outline';
        case 'cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'draft':
            return 'Draf';
        case 'published':
            return 'Dipublikasikan';
        case 'registration_open':
            return 'Pendaftaran Buka';
        case 'registration_closed':
            return 'Pendaftaran Tutup';
        case 'ongoing':
            return 'Sedang Berjalan';
        case 'completed':
            return 'Selesai';
        case 'cancelled':
            return 'Dibatalkan';
        default:
            return status;
    }
}

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return (
            new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Makassar',
            }).format(date) + ' WITA'
        );
    } catch {
        return dateStr;
    }
}

export default function AdminEventsIndex({ events, filters }: Props) {
    const handleStatusFilter = (status: string) => {
        router.get(
            eventsIndex().url,
            { status: status || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Turnamen & Event" />

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Manajemen Turnamen & Event
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola turnamen resmi Komunitas Beyblade
                                Samarinda, divisi kategori, dan jadwal arena.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={filters.status || ''}
                                onChange={(e) =>
                                    handleStatusFilter(e.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="draft">Draf</option>
                                <option value="registration_open">
                                    Pendaftaran Buka
                                </option>
                                <option value="registration_closed">
                                    Pendaftaran Tutup
                                </option>
                                <option value="ongoing">Sedang Berjalan</option>
                                <option value="completed">Selesai</option>
                            </select>

                            <Button render={<Link href={create().url} />}>
                                <Plus className="size-4" />
                                <span>Buat Event Baru</span>
                            </Button>
                        </div>
                    </div>

                    {/* Table inside Frame */}
                    <Frame className="w-full">
                        {events.data.length === 0 ? (
                            <Empty className="py-12">
                                <EmptyHeader>
                                    <Trophy className="size-10 text-muted-foreground" />
                                    <EmptyTitle>Belum ada turnamen</EmptyTitle>
                                    <EmptyDescription>
                                        Mulai dengan membuat event turnamen baru
                                        untuk komunitas blader.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <Button
                                    render={<Link href={create().url} />}
                                    className="mt-4"
                                >
                                    <Plus className="size-4" />
                                    <span>Buat Event Pertama</span>
                                </Button>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            Nama Event & Musim
                                        </TableHead>
                                        <TableHead>Venue (Samarinda)</TableHead>
                                        <TableHead>
                                            Jadwal Pelaksanaan
                                        </TableHead>
                                        <TableHead>
                                            Kategori / Peserta
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.data.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={
                                                        showEvent({
                                                            event: event.id,
                                                        }).url
                                                    }
                                                    className="font-semibold text-foreground hover:underline"
                                                >
                                                    {event.name}
                                                </Link>
                                                {event.season && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {event.season.name}{' '}
                                                        (Tier{' '}
                                                        {event.tier_multiplier}
                                                        x)
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <MapPin className="size-3.5 text-muted-foreground" />
                                                    <span>
                                                        {event.venue_name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.venue_city}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Calendar className="size-3.5 text-muted-foreground" />
                                                    <span>
                                                        {formatDate(
                                                            event.event_start_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <Trophy className="size-3.5 text-muted-foreground" />
                                                        {event.categories_count ??
                                                            0}{' '}
                                                        Kategori
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="size-3.5 text-muted-foreground" />
                                                        {event.registrations_count ??
                                                            0}{' '}
                                                        Blader
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getStatusBadgeVariant(
                                                        event.status,
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        event.status,
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <Link
                                                            href={
                                                                showEvent({
                                                                    event: event.id,
                                                                }).url
                                                            }
                                                        />
                                                    }
                                                >
                                                    Kelola
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Frame>

                    {/* Pagination outside Frame */}
                    <Pagination data={events} />
                </div>
            </div>
        </AppLayout>
    );
}
