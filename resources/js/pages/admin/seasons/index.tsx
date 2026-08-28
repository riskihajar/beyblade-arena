import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
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
import { create, edit, index as seasonsIndex } from '@/routes/admin/seasons';
import { type BreadcrumbItem } from '@/types';
import { type Season } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Plus, Trophy, Users } from 'lucide-react';

interface PaginatedSeasons {
    data: Season[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    seasons: PaginatedSeasons;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Musim Kompetisi', href: seasonsIndex().url },
];

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeZone: 'Asia/Makassar',
        }).format(date);
    } catch {
        return dateStr;
    }
}

export default function AdminSeasonsIndex({ seasons }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Musim Kompetisi" />

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-semibold tracking-tight">Musim Kompetisi & Liga</h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola musim tahunan komunitas, formula perolehan poin leaderboard, dan event terhubung.
                            </p>
                        </div>

                        <Button render={<Link href={create().url} />}>
                            <Plus className="size-4" />
                            <span>Buat Musim Baru</span>
                        </Button>
                    </div>

                    {/* Table inside Frame */}
                    <Frame className="w-full">
                        {seasons.data.length === 0 ? (
                            <Empty className="py-12">
                                <EmptyHeader>
                                    <Calendar className="size-10 text-muted-foreground" />
                                    <EmptyTitle>Belum ada musim kompetisi</EmptyTitle>
                                    <EmptyDescription>
                                        Buat musim baru seperti 'Musim 2026' untuk mulai mencatat akumulasi poin ranking.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Musim</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Event Terhubung</TableHead>
                                        <TableHead>Blader Terdaftar</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {seasons.data.map((season) => (
                                        <TableRow key={season.id}>
                                            <TableCell className="font-semibold text-foreground">
                                                {season.name}
                                                <p className="text-xs text-muted-foreground font-normal">Slug: {season.slug}</p>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(season.start_date)}
                                                {season.end_date && ` — ${formatDate(season.end_date)}`}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Trophy className="size-3.5 text-muted-foreground" />
                                                    {season.events_count ?? 0} Event
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Users className="size-3.5 text-muted-foreground" />
                                                    {season.rankings_count ?? 0} Blader
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={season.is_active ? 'default' : 'outline'}>
                                                    {season.is_active ? 'Musim Aktif' : 'Nonaktif / Selesai'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={<Link href={edit({ season: season.id }).url} />}
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

                    {/* Pagination */}
                    <Pagination data={seasons} />
                </div>
            </div>
        </AppLayout>
    );
}
