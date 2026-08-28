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
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BracketViewer } from '@/components/tournament/bracket-viewer';
import {
    generate as generateRoute,
    regenerate as regenerateRoute,
} from '@/routes/admin/bracket';
import { type BreadcrumbItem } from '@/types';
import {
    type RoundRobinStanding,
    type TournamentCategory,
    type TournamentMatch,
} from '@/types/tournament';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Flame,
    Lock,
    Play,
    RefreshCw,
    ShieldAlert,
    Swords,
    Trophy,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    category: TournamentCategory;
    matches: TournamentMatch[];
    standings?: RoundRobinStanding[] | null;
}

export default function AdminBracketView({
    category,
    matches,
    standings,
}: Props) {
    const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
    const [forceRegenerate, setForceRegenerate] = useState(false);
    const [reason, setReason] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Turnamen & Event', href: '/admin/events' },
        {
            title: category.event?.name || 'Event',
            href: `/admin/events/${category.event_id}`,
        },
        { title: `Bagan: ${category.name}`, href: '#' },
    ];

    const handleGenerate = () => {
        router.post(
            generateRoute({ category: category.id }).url,
            {},
            { preserveScroll: true },
        );
    };

    const handleRegenerateSubmit = () => {
        router.post(
            regenerateRoute({ category: category.id }).url,
            {
                force: forceRegenerate,
                reason: reason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRegenerateModalOpen(false);
                    setReason('');
                    setForceRegenerate(false);
                },
            },
        );
    };

    const hasMatches = matches.length > 0;
    const completedMatches = matches.filter(
        (m) => m.status === 'completed',
    ).length;
    const activeMatches = matches.filter(
        (m) => m.status === 'in_progress' || m.status === 'called',
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bagan Pertandingan: ${category.name}`} />

            <div className="container mx-auto space-y-6 px-4 py-8">
                {/* Header & Actions Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/events/${category.event_id}`}
                                className="inline-flex size-8 items-center justify-center rounded-md border hover:bg-muted"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        {category.name}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="capitalize"
                                    >
                                        {category.format}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {category.event?.name} • Target:{' '}
                                    {category.target_points} Poin •{' '}
                                    {category.ruleset?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {!hasMatches ? (
                            <Button
                                onClick={handleGenerate}
                                className="gap-1.5 font-semibold"
                            >
                                <Play className="size-4" />
                                <span>Buat Bagan Turnamen</span>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setRegenerateModalOpen(true)}
                                className="gap-1.5"
                            >
                                <RefreshCw className="size-4" />
                                <span>Regenerasi Bagan</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Match Status Stats Bar */}
                {hasMatches && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border bg-card p-3">
                            <span className="text-xs text-muted-foreground">
                                Total Pertandingan
                            </span>
                            <p className="text-xl font-bold text-foreground">
                                {matches.length}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <span className="text-xs text-muted-foreground">
                                Sedang Berjalan / Dipanggil
                            </span>
                            <p className="text-xl font-bold text-primary">
                                {activeMatches}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <span className="text-xs text-muted-foreground">
                                Selesai (Completed)
                            </span>
                            <p className="text-xl font-bold text-emerald-600">
                                {completedMatches}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <span className="text-xs text-muted-foreground">
                                Menunggu Jadwal
                            </span>
                            <p className="text-xl font-bold text-muted-foreground">
                                {matches.length -
                                    completedMatches -
                                    activeMatches}
                            </p>
                        </div>
                    </div>
                )}

                {/* Interactive Bracket Viewer */}
                <div className="rounded-xl border bg-card p-6 shadow-xs">
                    <BracketViewer
                        category={category}
                        matches={matches}
                        standings={standings}
                    />
                </div>
            </div>

            {/* Regenerate Confirmation Dialog */}
            <Dialog
                open={regenerateModalOpen}
                onOpenChange={setRegenerateModalOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            <DialogTitle>
                                Konfirmasi Regenerasi Bagan
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Tindakan ini akan menghapus susunan bagan dan jadwal
                            yang ada saat ini, lalu menyusun ulang berdasarkan
                            peserta yang telah check-in.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                        {completedMatches > 0 && (
                            <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <ShieldAlert className="size-4" />
                                    <span>
                                        Peringatan: Pertandingan Telah Berjalan!
                                    </span>
                                </div>
                                <p>
                                    Terdapat {completedMatches} pertandingan
                                    yang telah selesai. Untuk meregenerasi bagan
                                    aktif, Anda wajib mencentang konfirmasi
                                    paksa dan menuliskan alasan resmi.
                                </p>
                                <label className="flex cursor-pointer items-center gap-2 pt-1 font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={forceRegenerate}
                                        onChange={(e) =>
                                            setForceRegenerate(e.target.checked)
                                        }
                                        className="rounded border-destructive"
                                    />
                                    <span>
                                        Saya mengerti dan ingin meregenerasi
                                        paksa (Force Regenerate)
                                    </span>
                                </label>
                            </div>
                        )}

                        <Field name="regenerate_reason">
                            <FieldLabel htmlFor="regenerate_reason">
                                Alasan Regenerasi (Juri / Panitia)
                            </FieldLabel>
                            <Textarea
                                id="regenerate_reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Contoh: Penyesuaian seeding setelah verifikasi ulang kehadiran di meja registrasi."
                                rows={2}
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRegenerateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRegenerateSubmit}
                            disabled={
                                completedMatches > 0 &&
                                (!forceRegenerate || !reason.trim())
                            }
                        >
                            Regenerasi Bagan Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
