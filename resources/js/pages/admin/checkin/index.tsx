import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Frame } from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
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
    checkin as checkinRoute,
    noShow as noShowRoute,
    promote as promoteRoute,
} from '@/routes/admin/checkin';
import { type BreadcrumbItem } from '@/types';
import { type Registration } from '@/types/tournament';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Lock,
    Search,
    ShieldCheck,
    Swords,
    Unlock,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface PaginatedRegistrations {
    data: Registration[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    registrations: PaginatedRegistrations;
    events: Array<{ id: string; name: string; categories: Array<{ id: string; name: string }> }>;
    filters: {
        event_id?: string;
        category_id?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Turnamen & Event', href: '/admin/events' },
    { title: 'Fast Check-in Venue', href: '#' },
];

export default function AdminCheckinIndex({ registrations, events, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/admin/checkin',
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    const handleCheckin = (registrationId: string) => {
        router.post(checkinRoute({ registration: registrationId }).url, {}, { preserveScroll: true });
    };

    const handleNoShow = (registrationId: string) => {
        if (!confirm('Tandai peserta sebagai No-Show? Slot akan otomatis dialihkan ke antrean Waitlist.')) return;
        router.post(noShowRoute({ registration: registrationId }).url, {}, { preserveScroll: true });
    };

    const handlePromote = (registrationId: string) => {
        router.post(promoteRoute({ registration: registrationId }).url, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fast Check-in Meja Registrasi Venue" />

            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <UserCheck className="size-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Fast Check-in Meja Registrasi Venue</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Pindai atau cari peserta di meja registrasi, verifikasi kelayakan combo deck, dan kunci deck sebelum babak dimulai.
                    </p>
                </div>

                {/* Search & Event Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filters.event_id || ''}
                        onChange={(e) => handleFilterChange('event_id', e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                    >
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.name}
                            </option>
                        ))}
                    </select>

                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Ketik nama blader, nickname, atau ID..."
                                className="h-10 pl-9 text-sm"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="h-10">
                            Cari
                        </Button>
                    </form>
                </div>

                {/* Table Frame */}
                <Frame className="w-full">
                    {registrations.data.length === 0 ? (
                        <Empty className="py-12">
                            <EmptyHeader>
                                <UserCheck className="size-10 text-muted-foreground" />
                                <EmptyTitle>Tidak ada peserta yang cocok</EmptyTitle>
                                <EmptyDescription>
                                    Gunakan kotak pencarian di atas untuk mencari nama blader.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seed / Blader</TableHead>
                                    <TableHead>Divisi Kategori</TableHead>
                                    <TableHead>Combo Deck (Takara Tomy)</TableHead>
                                    <TableHead>Status Saat Ini</TableHead>
                                    <TableHead>Deck Lock</TableHead>
                                    <TableHead className="text-right">Aksi Check-in</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.data.map((reg) => (
                                    <TableRow
                                        key={reg.id}
                                        className={
                                            reg.status === 'checked_in'
                                                ? 'bg-emerald-500/5'
                                                : reg.status === 'waitlisted'
                                                ? 'bg-amber-500/5'
                                                : undefined
                                        }
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2.5">
                                                {reg.seed_number ? (
                                                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                                                        #{reg.seed_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                                <div>
                                                    <span className="font-bold text-foreground text-sm">
                                                        {reg.display_nickname}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground">{reg.user?.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-sm font-medium">
                                            {reg.category?.name}
                                        </TableCell>

                                        <TableCell className="text-xs">
                                            {reg.deck_data && reg.deck_data.length > 0 ? (
                                                <div className="space-y-0.5">
                                                    {reg.deck_data.map((c, i) => (
                                                        <p key={i} className="text-muted-foreground">
                                                            #{i + 1} <span className="font-semibold text-foreground">{c.blade}</span> ({c.ratchet} {c.bit})
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Belum submit combo</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {reg.status === 'checked_in' ? (
                                                <Badge variant="default" className="bg-emerald-600 gap-1 text-xs">
                                                    <CheckCircle2 className="size-3" />
                                                    Checked-in
                                                </Badge>
                                            ) : reg.status === 'confirmed' ? (
                                                <Badge variant="secondary" className="gap-1 text-xs">
                                                    <Clock className="size-3" />
                                                    Confirmed (Menunggu)
                                                </Badge>
                                            ) : reg.status === 'waitlisted' ? (
                                                <Badge variant="outline" className="text-amber-600 border-amber-600 gap-1 text-xs">
                                                    Waitlist
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="text-xs">
                                                    {reg.status}
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {reg.is_deck_locked ? (
                                                <Badge variant="default" className="gap-1 text-[10px]">
                                                    <Lock className="size-3" />
                                                    Terkunci
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1 text-[10px]">
                                                    <Unlock className="size-3" />
                                                    Terbuka
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            {reg.status === 'confirmed' && (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                                                        onClick={() => handleCheckin(reg.id)}
                                                    >
                                                        <CheckCircle2 className="size-4 mr-1" />
                                                        <span>Check-in</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleNoShow(reg.id)}
                                                    >
                                                        No-Show
                                                    </Button>
                                                </div>
                                            )}

                                            {reg.status === 'checked_in' && (
                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                                    <ShieldCheck className="size-4" />
                                                    Siap Tanding
                                                </span>
                                            )}

                                            {reg.status === 'waitlisted' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                                                    onClick={() => handlePromote(reg.id)}
                                                >
                                                    Promosikan
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Frame>

                {/* Pagination */}
                <Pagination data={registrations} />
            </div>
        </AppLayout>
    );
}
