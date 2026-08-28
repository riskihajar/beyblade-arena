import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Frame } from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { call as callMatchRoute } from '@/routes/admin/matches';
import { store as storeStadiumRoute } from '@/routes/admin/stadiums';
import { type BreadcrumbItem } from '@/types';
import { type Stadium, type TournamentMatch } from '@/types/tournament';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Flame,
    Megaphone,
    Play,
    Plus,
    Shield,
    Swords,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    stadiums: Stadium[];
    readyMatches: TournamentMatch[];
    events: Array<{ id: string; name: string }>;
    judges: Array<{ id: string; name: string; email: string }>;
    selectedEventId?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Turnamen & Event', href: '/admin/events' },
    { title: 'Stadium & Panggilan Match', href: '#' },
];

export default function AdminStadiumsIndex({
    stadiums,
    readyMatches,
    events,
    judges,
    selectedEventId,
}: Props) {
    const [callModalMatch, setCallModalMatch] =
        useState<TournamentMatch | null>(null);
    const [selectedStadiumId, setSelectedStadiumId] = useState<string>('');
    const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
    const [addStadiumModalOpen, setAddStadiumModalOpen] = useState(false);
    const [newStadiumName, setNewStadiumName] = useState('');
    const [newStadiumModel, setNewStadiumModel] = useState(
        'Standard Xtreme Beystadium (UX-04)',
    );

    const availableStadiums = stadiums.filter((s) => s.status === 'available');

    const openCallModal = (match: TournamentMatch) => {
        setCallModalMatch(match);
        setSelectedStadiumId(availableStadiums[0]?.id || stadiums[0]?.id || '');
        setSelectedJudgeId('');
    };

    const submitCallMatch = () => {
        if (!callModalMatch || !selectedStadiumId) return;

        router.post(
            callMatchRoute({ match: callModalMatch.id }).url,
            {
                stadium_id: selectedStadiumId,
                judge_id: selectedJudgeId || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => setCallModalMatch(null),
            },
        );
    };

    const submitAddStadium = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId || !newStadiumName.trim()) return;

        router.post(
            storeStadiumRoute().url,
            {
                event_id: selectedEventId,
                name: newStadiumName,
                model_type: newStadiumModel,
                status: 'available',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddStadiumModalOpen(false);
                    setNewStadiumName('');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Stadium & Papan Panggilan Pertandingan" />

            <div className="container mx-auto space-y-8 px-4 py-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Megaphone className="size-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                Manajemen Arena Stadium & Panggilan
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Pantau status stadium venue secara real-time dan
                            panggil pertandingan yang siap tanding.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-64">
                            <NativeSelect
                                value={selectedEventId || ''}
                                onChange={(e) =>
                                    router.get('/admin/stadiums', {
                                        event_id: e.target.value,
                                    })
                                }
                            >
                                {events.map((ev) => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>

                        <Button
                            onClick={() => setAddStadiumModalOpen(true)}
                            className="gap-1.5 font-semibold"
                        >
                            <Plus className="size-4" />
                            <span>Tambah Arena</span>
                        </Button>
                    </div>
                </div>

                {/* Stadium Grid */}
                <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Swords className="size-4 text-primary" />
                        Arena Stadium di Venue ({stadiums.length} Stadium)
                    </h2>

                    {stadiums.length === 0 ? (
                        <Empty className="rounded-xl border bg-card py-8">
                            <EmptyHeader>
                                <Swords className="size-8 text-muted-foreground" />
                                <EmptyTitle>
                                    Belum ada arena stadium terdaftar
                                </EmptyTitle>
                                <EmptyDescription>
                                    Tambahkan arena stadium (misal: Stadium A,
                                    Stadium B) untuk event ini.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {stadiums.map((stadium) => {
                                const isAvailable =
                                    stadium.status === 'available';
                                const isBusy = stadium.status === 'in_use';

                                return (
                                    <Card
                                        key={stadium.id}
                                        className={`border transition-all ${
                                            isBusy
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : isAvailable
                                                  ? 'border-emerald-500/30 bg-emerald-500/5'
                                                  : 'border-border bg-muted/20'
                                        }`}
                                    >
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant={
                                                        isAvailable
                                                            ? 'success'
                                                            : isBusy
                                                              ? 'default'
                                                              : 'outline'
                                                    }
                                                >
                                                    {isAvailable
                                                        ? 'Tersedia (Ready)'
                                                        : isBusy
                                                          ? 'Sedang Tanding'
                                                          : 'Maintenance'}
                                                </Badge>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {stadium.model_type}
                                                </span>
                                            </div>
                                            <CardTitle className="mt-1 text-lg font-bold text-foreground">
                                                {stadium.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Juri:{' '}
                                                {stadium.assigned_judge?.name ||
                                                    'Belum Ditetapkan'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2 text-xs">
                                            {isBusy ? (
                                                <div className="space-y-1 rounded-md border border-primary/20 bg-primary/10 p-2.5">
                                                    <span className="block font-semibold text-primary">
                                                        Pertandingan Berlangsung
                                                    </span>
                                                    <p className="text-muted-foreground">
                                                        Menunggu input juri
                                                        selesai...
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                                                    Siap menerima panggilan
                                                    pertandingan berikutnya.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Match Calling Queue */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Clock className="size-4 text-primary" />
                            Antrean Pertandingan Siap Panggil (
                            {readyMatches.length} Match)
                        </h2>
                    </div>

                    <Frame className="w-full">
                        {readyMatches.length === 0 ? (
                            <Empty className="py-8">
                                <EmptyHeader>
                                    <Clock className="size-8 text-muted-foreground" />
                                    <EmptyTitle>
                                        Tidak ada match yang siap dipanggil
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        Semua match yang siap sudah dipanggil
                                        atau masih menunggu pemenang babak
                                        sebelumnya.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Match #</TableHead>
                                        <TableHead>Divisi Kategori</TableHead>
                                        <TableHead>
                                            Pertarungan Blader
                                        </TableHead>
                                        <TableHead>Babak</TableHead>
                                        <TableHead className="text-right">
                                            Aksi Panggilan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {readyMatches.map((match) => (
                                        <TableRow key={match.id}>
                                            <TableCell className="font-mono text-xs font-bold">
                                                Match #{match.match_order}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {match.category?.name}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <span className="font-bold text-foreground">
                                                    {match.player1
                                                        ?.display_nickname ||
                                                        match.player1?.user
                                                            ?.name}
                                                </span>
                                                <span className="mx-1.5 text-muted-foreground">
                                                    vs
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {match.player2
                                                        ?.display_nickname ||
                                                        match.player2?.user
                                                            ?.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                Ronde {match.round_number}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 font-semibold"
                                                    onClick={() =>
                                                        openCallModal(match)
                                                    }
                                                >
                                                    <Megaphone className="size-3.5" />
                                                    <span>
                                                        Panggil ke Stadium
                                                    </span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Frame>
                </div>
            </div>

            {/* Call Match Dialog */}
            <Dialog
                open={!!callModalMatch}
                onOpenChange={(open) => !open && setCallModalMatch(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary">
                            <Megaphone className="size-5" />
                            <DialogTitle>
                                Panggil Pertandingan ke Stadium
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Tugaskan Match #{callModalMatch?.match_order} (
                            {callModalMatch?.player1?.display_nickname} vs{' '}
                            {callModalMatch?.player2?.display_nickname}) ke
                            arena yang tersedia.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogPanel className="space-y-4 py-2 text-xs">
                        <Field name="stadium_select">
                            <FieldLabel>Pilih Stadium Arena</FieldLabel>
                            <NativeSelect
                                value={selectedStadiumId}
                                onChange={(e) =>
                                    setSelectedStadiumId(e.target.value)
                                }
                            >
                                {stadiums.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.status})
                                    </option>
                                ))}
                            </NativeSelect>
                        </Field>

                        <Field name="judge_select">
                            <FieldLabel>
                                Pilih Juri yang Bertugas (Opsional)
                            </FieldLabel>
                            <NativeSelect
                                value={selectedJudgeId}
                                onChange={(e) =>
                                    setSelectedJudgeId(e.target.value)
                                }
                            >
                                <option value="">
                                    Gunakan Juri Bawaan Stadium
                                </option>
                                {judges.map((j) => (
                                    <option key={j.id} value={j.id}>
                                        {j.name} ({j.email})
                                    </option>
                                ))}
                            </NativeSelect>
                        </Field>
                    </DialogPanel>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCallModalMatch(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={submitCallMatch}
                            disabled={!selectedStadiumId}
                        >
                            Panggil Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Stadium Dialog */}
            <Dialog
                open={addStadiumModalOpen}
                onOpenChange={setAddStadiumModalOpen}
            >
                <DialogContent className="max-w-md">
                    <form onSubmit={submitAddStadium}>
                        <DialogHeader>
                            <DialogTitle>Tambah Arena Stadium Baru</DialogTitle>
                            <DialogDescription>
                                Daftarkan arena pertandingan fisik di venue
                                event ini.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogPanel className="space-y-4 py-4 text-xs">
                            <Field name="stadium_name">
                                <FieldLabel>Nama Stadium Arena</FieldLabel>
                                <Input
                                    value={newStadiumName}
                                    onChange={(e) =>
                                        setNewStadiumName(e.target.value)
                                    }
                                    placeholder="Contoh: Stadium A (Atrium Depan)"
                                    required
                                />
                            </Field>

                            <Field name="stadium_model">
                                <FieldLabel>Tipe / Model Stadium</FieldLabel>
                                <Input
                                    value={newStadiumModel}
                                    onChange={(e) =>
                                        setNewStadiumModel(e.target.value)
                                    }
                                    placeholder="Standard Xtreme Beystadium (UX-04)"
                                    required
                                />
                            </Field>
                        </DialogPanel>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddStadiumModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan Arena</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
