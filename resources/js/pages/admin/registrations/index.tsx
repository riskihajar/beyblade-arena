import { Badge } from '@/components/ui/badge';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    destroy as destroyReg,
    overrideDeck as overrideDeckRoute,
    updateStatus as updateStatusRoute,
} from '@/routes/admin/registrations';
import { type BreadcrumbItem } from '@/types';
import { type BeyCombo, type Event, type Registration } from '@/types/tournament';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Lock,
    Pencil,
    Search,
    Shield,
    Swords,
    Trash2,
    Unlock,
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
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Turnamen & Event', href: '/admin/events' },
    { title: 'Daftar Peserta & Waitlist', href: '#' },
];

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
        case 'confirmed':
        case 'checked_in':
            return 'default';
        case 'waitlisted':
            return 'secondary';
        case 'cancelled':
        case 'rejected':
        case 'disqualified':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function AdminRegistrationsIndex({ registrations, events, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [overrideModalReg, setOverrideModalReg] = useState<Registration | null>(null);
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideDeck, setOverrideDeck] = useState<BeyCombo[]>([]);

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/admin/registrations',
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    const handleUpdateStatus = (registrationId: string, newStatus: string) => {
        if (!confirm(`Ubah status peserta menjadi ${newStatus}?`)) return;
        router.patch(updateStatusRoute({ registration: registrationId }).url, { status: newStatus }, { preserveScroll: true });
    };

    const handleDelete = (registrationId: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus pendaftaran peserta ini?')) return;
        router.delete(destroyReg({ registration: registrationId }).url, { preserveScroll: true });
    };

    const openOverrideModal = (reg: Registration) => {
        setOverrideModalReg(reg);
        setOverrideReason('');
        setOverrideDeck(
            reg.deck_data && reg.deck_data.length > 0
                ? JSON.parse(JSON.stringify(reg.deck_data))
                : [
                      { blade: 'Dran Sword', ratchet: '3-60', bit: 'Flat (F)' },
                      { blade: 'Hells Scythe', ratchet: '4-60', bit: 'Ball (B)' },
                      { blade: 'Wizard Rod', ratchet: '5-70', bit: 'Hexa (H)' },
                  ]
        );
    };

    const submitOverrideDeck = () => {
        if (!overrideModalReg) return;
        if (!overrideReason.trim()) {
            alert('Alasan resmi tertulis juri wajib diisi!');
            return;
        }

        router.patch(
            overrideDeckRoute({ registration: overrideModalReg.id }).url,
            {
                reason: overrideReason,
                deck_data: overrideDeck,
            },
            {
                preserveScroll: true,
                onSuccess: () => setOverrideModalReg(null),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Peserta & Waitlist Turnamen" />

            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Manajemen Peserta & Waitlist</h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola antrean pendaftar, kuota divisi, promosi waitlist otomatis, dan override deck part.
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filters.event_id || ''}
                        onChange={(e) => handleFilterChange('event_id', e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="">Semua Event</option>
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="">Semua Status</option>
                        <option value="confirmed">Confirmed (Terkonfirmasi)</option>
                        <option value="checked_in">Checked In (Hadir)</option>
                        <option value="waitlisted">Waitlisted (Antrean)</option>
                        <option value="no_show">No Show</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari blader / email / ID..."
                            className="h-9 w-60 text-sm"
                        />
                        <Button type="submit" variant="secondary" size="sm">
                            <Search className="size-4" />
                        </Button>
                    </form>
                </div>

                {/* Table Frame */}
                <Frame className="w-full">
                    {registrations.data.length === 0 ? (
                        <Empty className="py-12">
                            <EmptyHeader>
                                <Users className="size-10 text-muted-foreground" />
                                <EmptyTitle>Belum ada pendaftar</EmptyTitle>
                                <EmptyDescription>
                                    Belum ada blader yang terdaftar sesuai kriteria pencarian atau filter yang dipilih.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Seed / Nickname</TableHead>
                                    <TableHead>Event & Kategori</TableHead>
                                    <TableHead>Deck Combo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Deck Lock</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.data.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {reg.seed_number ? (
                                                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                        #{reg.seed_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-foreground">{reg.display_nickname}</span>
                                                    <p className="text-xs text-muted-foreground">{reg.user?.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <p className="font-medium text-foreground">{reg.category?.name}</p>
                                            <p className="text-xs text-muted-foreground">{reg.event?.name}</p>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {reg.deck_data && reg.deck_data.length > 0 ? (
                                                <div className="space-y-0.5">
                                                    {reg.deck_data.map((c, i) => (
                                                        <p key={i} className="text-muted-foreground">
                                                            #{i + 1} <span className="font-medium text-foreground">{c.blade}</span> ({c.ratchet} {c.bit})
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Belum submit</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(reg.status)}>
                                                {reg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {reg.is_deck_locked ? (
                                                <Badge variant="default" className="gap-1 text-[10px]">
                                                    <Lock className="size-3" />
                                                    Locked
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="gap-1 text-[10px]">
                                                    <Unlock className="size-3" />
                                                    Open
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="icon-sm"
                                                    title="Override Part Deck"
                                                    onClick={() => openOverrideModal(reg)}
                                                >
                                                    <Swords className="size-3.5 text-primary" />
                                                </Button>

                                                {reg.status === 'waitlisted' ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                                    >
                                                        Promosikan
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        title="Hapus / Batalkan"
                                                        onClick={() => handleDelete(reg.id)}
                                                    >
                                                        <Trash2 className="size-3.5 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
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

            {/* Deck Override Dialog */}
            <Dialog open={!!overrideModalReg} onOpenChange={(open) => !open && setOverrideModalReg(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Override Part Deck Blader</DialogTitle>
                        <DialogDescription>
                            Ganti part deck blader <span className="font-semibold text-foreground">{overrideModalReg?.display_nickname}</span> setelah terkunci. Perubahan ini akan dicatat ke audit log.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <Field name="override_reason">
                            <FieldLabel htmlFor="override_reason">Alasan Resmi Pergantian Part (Juri/Wasit)</FieldLabel>
                            <Textarea
                                id="override_reason"
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                placeholder="Contoh: Part Bit pecah/rusak saat pertarungan ronde 1 sesuai keputusan Head Judge."
                                rows={2}
                                required
                            />
                        </Field>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-foreground">Combo Deck Baru:</p>
                            {overrideDeck.map((combo, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2 rounded-md border p-2 text-xs">
                                    <input
                                        type="text"
                                        value={combo.blade}
                                        onChange={(e) => {
                                            const next = [...overrideDeck];
                                            next[idx].blade = e.target.value;
                                            setOverrideDeck(next);
                                        }}
                                        className="h-7 rounded border px-1.5 text-xs"
                                        placeholder="Blade"
                                    />
                                    <input
                                        type="text"
                                        value={combo.ratchet}
                                        onChange={(e) => {
                                            const next = [...overrideDeck];
                                            next[idx].ratchet = e.target.value;
                                            setOverrideDeck(next);
                                        }}
                                        className="h-7 rounded border px-1.5 text-xs"
                                        placeholder="Ratchet"
                                    />
                                    <input
                                        type="text"
                                        value={combo.bit}
                                        onChange={(e) => {
                                            const next = [...overrideDeck];
                                            next[idx].bit = e.target.value;
                                            setOverrideDeck(next);
                                        }}
                                        className="h-7 rounded border px-1.5 text-xs"
                                        placeholder="Bit"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOverrideModalReg(null)}>
                            Batal
                        </Button>
                        <Button onClick={submitOverrideDeck}>
                            Simpan & Catat Override
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
