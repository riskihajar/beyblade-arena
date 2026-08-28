import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
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
import {
    create as createCategory,
    edit as editCategory,
} from '@/routes/admin/categories';
import { edit as editEvent, index as eventsIndex } from '@/routes/admin/events';
import { type BreadcrumbItem } from '@/types';
import { type Event } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    ExternalLink,
    MapPin,
    Pencil,
    Plus,
    Shield,
    Swords,
    Trophy,
    Users,
} from 'lucide-react';

interface Props {
    event: Event;
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

function formatCurrency(amount: string | number): string {
    const num = Number(amount);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
}

export default function AdminEventsShow({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Turnamen & Event', href: eventsIndex().url },
        { title: event.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Turnamen: ${event.name}`} />

            <div className="container mx-auto space-y-8 px-4 py-8">
                {/* Event Top Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            render={<Link href={eventsIndex().url} />}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {event.name}
                                </h1>
                                <Badge
                                    variant={
                                        event.status === 'registration_open'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {event.status}
                                </Badge>
                                {event.season && (
                                    <Badge variant="outline">
                                        {event.season.name} (Tier{' '}
                                        {event.tier_multiplier}x)
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Diselenggarakan oleh: {event.organizer?.name} (
                                {event.organizer?.email})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            render={
                                <Link
                                    href={editEvent({ event: event.id }).url}
                                />
                            }
                        >
                            <Pencil className="size-4" />
                            <span>Edit Event</span>
                        </Button>
                    </div>
                </div>

                {/* Event Overview Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Venue & Location */}
                    <Frame className="w-full">
                        <FrameHeader>
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-muted-foreground" />
                                <FrameTitle>Lokasi Venue</FrameTitle>
                            </div>
                        </FrameHeader>
                        <FramePanel className="space-y-2 text-sm">
                            <p className="font-semibold text-foreground">
                                {event.venue_name}
                            </p>
                            <p className="text-muted-foreground">
                                {event.venue_address || 'Samarinda'}
                            </p>
                            <p className="font-medium text-foreground">
                                {event.venue_city}
                            </p>
                            {event.venue_maps_url && (
                                <a
                                    href={event.venue_maps_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <span>Buka di Google Maps</span>
                                    <ExternalLink className="size-3" />
                                </a>
                            )}
                        </FramePanel>
                    </Frame>

                    {/* Schedule */}
                    <Frame className="w-full">
                        <FrameHeader>
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-muted-foreground" />
                                <FrameTitle>Jadwal Turnamen (WITA)</FrameTitle>
                            </div>
                        </FrameHeader>
                        <FramePanel className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Pelaksanaan Turnamen
                                </p>
                                <p className="font-medium text-foreground">
                                    {formatDate(event.event_start_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Periode Pendaftaran
                                </p>
                                <p className="font-medium text-foreground">
                                    {formatDate(event.registration_start_at)}{' '}
                                    s/d {formatDate(event.registration_end_at)}
                                </p>
                            </div>
                        </FramePanel>
                    </Frame>

                    {/* Economics & Rules */}
                    <Frame className="w-full">
                        <FrameHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="size-4 text-muted-foreground" />
                                <FrameTitle>Biaya & Peringkat Liga</FrameTitle>
                            </div>
                        </FrameHeader>
                        <FramePanel className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Biaya Registrasi
                                </p>
                                <p className="font-semibold text-foreground">
                                    {formatCurrency(event.entry_fee)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Kelayakan Poin Musim
                                </p>
                                <Badge
                                    variant={
                                        event.is_ranking_eligible
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    {event.is_ranking_eligible
                                        ? 'Eligible Ranking Musim'
                                        : 'Non-Ranking (Gathering Santai)'}
                                </Badge>
                            </div>
                        </FramePanel>
                    </Frame>
                </div>

                {/* Categories Management Section */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">
                                Divisi & Kategori Pertandingan
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Daftar divisi umur, sistem kompetisi, target
                                poin, dan ruleset scoring.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            render={
                                <Link
                                    href={
                                        createCategory().url +
                                        `?event_id=${event.id}`
                                    }
                                />
                            }
                        >
                            <Plus className="size-4" />
                            <span>Tambah Kategori</span>
                        </Button>
                    </div>

                    <Frame className="w-full">
                        {!event.categories || event.categories.length === 0 ? (
                            <Empty className="py-8">
                                <EmptyHeader>
                                    <Trophy className="size-8 text-muted-foreground" />
                                    <EmptyTitle>Belum ada kategori</EmptyTitle>
                                    <EmptyDescription>
                                        Tambahkan kategori divisi seperti Open
                                        Master atau Junior Division (U-12).
                                    </EmptyDescription>
                                </EmptyHeader>
                                <Button
                                    size="sm"
                                    className="mt-3"
                                    render={
                                        <Link
                                            href={
                                                createCategory().url +
                                                `?event_id=${event.id}`
                                            }
                                        />
                                    }
                                >
                                    <Plus className="size-4" />
                                    <span>Tambah Kategori Sekarang</span>
                                </Button>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Kategori</TableHead>
                                        <TableHead>
                                            Format & Target Poin
                                        </TableHead>
                                        <TableHead>Ruleset Scoring</TableHead>
                                        <TableHead>Deck Lock Policy</TableHead>
                                        <TableHead>Kuota Peserta</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {event.categories.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-semibold text-foreground">
                                                {cat.name}
                                                {cat.min_age && cat.max_age && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Usia: {cat.min_age} -{' '}
                                                        {cat.max_age} Tahun
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {cat.format}
                                                </Badge>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    Target: {cat.target_points}{' '}
                                                    Poin (Timeout{' '}
                                                    {cat.call_timeout_seconds}s)
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium">
                                                    {cat.ruleset?.name ||
                                                        'Default'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Spin:{' '}
                                                    {
                                                        cat.ruleset
                                                            ?.spin_finish_points
                                                    }
                                                    pt | Over:{' '}
                                                    {
                                                        cat.ruleset
                                                            ?.over_finish_points
                                                    }
                                                    pt | Burst:{' '}
                                                    {
                                                        cat.ruleset
                                                            ?.burst_finish_points
                                                    }
                                                    pt | Xtreme:{' '}
                                                    {
                                                        cat.ruleset
                                                            ?.xtreme_finish_points
                                                    }
                                                    pt
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {cat.deck_lock_policy}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Users className="size-3.5 text-muted-foreground" />
                                                    Maks. {cat.max_participants}{' '}
                                                    Blader
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <Link
                                                            href={
                                                                editCategory({
                                                                    category:
                                                                        cat.id,
                                                                }).url
                                                            }
                                                        />
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Frame>
                </div>

                {/* Stadiums Section */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                            Arena & Stadium Pertandingan
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Stadium Extreme yang disiapkan di venue turnamen
                            Samarinda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {event.stadiums?.map((stadium) => (
                            <Frame key={stadium.id} className="w-full">
                                <FrameHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Swords className="size-4 text-primary" />
                                            <FrameTitle>
                                                {stadium.name}
                                            </FrameTitle>
                                        </div>
                                        <Badge
                                            variant={
                                                stadium.status === 'available'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {stadium.status}
                                        </Badge>
                                    </div>
                                </FrameHeader>
                                <FramePanel className="space-y-2 text-sm">
                                    <p className="text-xs text-muted-foreground">
                                        Tipe: {stadium.model_type}
                                    </p>
                                    {stadium.assigned_judge && (
                                        <p className="text-xs text-muted-foreground">
                                            Juri:{' '}
                                            <span className="font-medium text-foreground">
                                                {stadium.assigned_judge.name}
                                            </span>
                                        </p>
                                    )}
                                    {stadium.notes && (
                                        <p className="text-xs text-muted-foreground italic">
                                            {stadium.notes}
                                        </p>
                                    )}
                                </FramePanel>
                            </Frame>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
