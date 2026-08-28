import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    battle as battleRoute,
    correct as correctRoute,
    dispute as disputeRoute,
    walkover as walkoverRoute,
} from '@/routes/judge/matches';
import { type TournamentMatch } from '@/types/tournament';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Flame,
    RotateCcw,
    ShieldAlert,
    Swords,
    Trophy,
    User,
    UserX,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    match: TournamentMatch;
}

export function JudgeScorePad({ match }: Props) {
    const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(
        match.player1_id || null,
    );
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [walkoverModalOpen, setWalkoverModalOpen] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [walkoverReason, setWalkoverReason] = useState('');
    const [walkoverPresentId, setWalkoverPresentId] = useState<string>(
        match.player1_id || '',
    );

    const isCompleted =
        match.status === 'completed' || match.status === 'walkover';
    const isDisputed = match.status === 'disputed' || match.is_disputed;

    const targetPoints = Number(
        match.ruleset_snapshot?.points_to_win ??
            match.category?.target_points ??
            4,
    );
    const isPlayer1Leader = match.player1_score > match.player2_score;
    const isPlayer2Leader = match.player2_score > match.player1_score;

    const player1Name =
        match.player1?.display_nickname ||
        match.player1?.user?.name ||
        'Blader 1';
    const player2Name =
        match.player2?.display_nickname ||
        match.player2?.user?.name ||
        'Blader 2';

    const handleRecordFinish = (finishType: string) => {
        if (!selectedWinnerId || isCompleted) return;

        const clientRequestId = `battle-${match.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        router.post(
            battleRoute({ match: match.id }).url,
            {
                winner_id: selectedWinnerId,
                finish_type: finishType,
                is_draw: false,
                client_request_id: clientRequestId,
            },
            { preserveScroll: true },
        );
    };

    const handleRecordDraw = () => {
        if (isCompleted) return;

        const clientRequestId = `draw-${match.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        router.post(
            battleRoute({ match: match.id }).url,
            {
                is_draw: true,
                client_request_id: clientRequestId,
            },
            { preserveScroll: true },
        );
    };

    const submitWalkover = () => {
        if (!walkoverReason.trim()) {
            alert('Alasan WO wajib diisi!');
            return;
        }

        router.post(
            walkoverRoute({ match: match.id }).url,
            {
                present_player_id: walkoverPresentId,
                reason: walkoverReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => setWalkoverModalOpen(false),
            },
        );
    };

    const submitDispute = () => {
        if (!disputeReason.trim()) {
            alert('Alasan sengketa / dispute wajib diisi!');
            return;
        }

        router.post(
            disputeRoute({ match: match.id }).url,
            {
                reason: disputeReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => setDisputeModalOpen(false),
            },
        );
    };

    return (
        <div className="mx-auto max-w-xl space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {match.category?.name} • Match #{match.match_order}
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                        {match.stadium?.name || 'Stadium Arena'}
                    </h2>
                </div>
                <Badge
                    variant={
                        isCompleted
                            ? 'default'
                            : isDisputed
                              ? 'destructive'
                              : 'secondary'
                    }
                    className="text-xs"
                >
                    Target {targetPoints} Pts • {match.status}
                </Badge>
            </div>

            {/* Live Score Display Cards */}
            <div className="grid grid-cols-2 gap-3">
                {/* Player 1 Card */}
                <div
                    onClick={() =>
                        !isCompleted &&
                        setSelectedWinnerId(match.player1_id || null)
                    }
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                        selectedWinnerId === match.player1_id
                            ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40'
                            : 'border-border bg-card opacity-90'
                    }`}
                >
                    <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <User className="size-3.5" />
                        <span className="truncate font-semibold">
                            {player1Name}
                        </span>
                    </div>
                    <div className="py-2 font-mono text-5xl font-black tracking-tight text-foreground">
                        {match.player1_score}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-primary">
                        {selectedWinnerId === match.player1_id
                            ? 'Pemenang Ronde Aktif'
                            : 'Klik untuk Pilih'}
                    </div>
                </div>

                {/* Player 2 Card */}
                <div
                    onClick={() =>
                        !isCompleted &&
                        setSelectedWinnerId(match.player2_id || null)
                    }
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                        selectedWinnerId === match.player2_id
                            ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40'
                            : 'border-border bg-card opacity-90'
                    }`}
                >
                    <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <User className="size-3.5" />
                        <span className="truncate font-semibold">
                            {player2Name}
                        </span>
                    </div>
                    <div className="py-2 font-mono text-5xl font-black tracking-tight text-foreground">
                        {match.player2_score}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-primary">
                        {selectedWinnerId === match.player2_id
                            ? 'Pemenang Ronde Aktif'
                            : 'Klik untuk Pilih'}
                    </div>
                </div>
            </div>

            {/* Victory Banner */}
            {isCompleted && (
                <div className="space-y-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                    <div className="mb-1 inline-flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                        <Trophy className="size-5" />
                    </div>
                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                        Pertandingan Selesai!
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        Pemenang:{' '}
                        <span className="font-bold">
                            {match.winner?.display_nickname ||
                                match.winner?.user?.name}
                        </span>{' '}
                        ({match.player1_score} - {match.player2_score})
                    </p>
                </div>
            )}

            {/* Interactive Finish Buttons (Touch Target >= 48px) */}
            {!isCompleted && (
                <div className="space-y-3">
                    <span className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Input Hasil Finish Battle (Untuk Blader Terpilih)
                    </span>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <Button
                            type="button"
                            size="lg"
                            variant="secondary"
                            onClick={() => handleRecordFinish('spin_finish')}
                            className="h-14 flex-col gap-0.5 border text-xs font-bold hover:border-primary"
                        >
                            <span>Spin Finish</span>
                            <span className="text-[10px] font-normal text-muted-foreground">
                                +1 Poin
                            </span>
                        </Button>

                        <Button
                            type="button"
                            size="lg"
                            variant="secondary"
                            onClick={() => handleRecordFinish('over_finish')}
                            className="h-14 flex-col gap-0.5 border text-xs font-bold hover:border-primary"
                        >
                            <span>Over Finish</span>
                            <span className="text-[10px] font-normal text-muted-foreground">
                                +2 Poin
                            </span>
                        </Button>

                        <Button
                            type="button"
                            size="lg"
                            variant="secondary"
                            onClick={() => handleRecordFinish('burst_finish')}
                            className="h-14 flex-col gap-0.5 border text-xs font-bold hover:border-primary"
                        >
                            <span>Burst Finish</span>
                            <span className="text-[10px] font-normal text-muted-foreground">
                                +2 Poin
                            </span>
                        </Button>

                        <Button
                            type="button"
                            size="lg"
                            className="h-14 flex-col gap-0.5 bg-linear-to-r from-red-600 to-amber-600 text-xs font-black text-white shadow-xs hover:from-red-700 hover:to-amber-700"
                            onClick={() => handleRecordFinish('xtreme_finish')}
                        >
                            <span className="flex items-center gap-1">
                                <Zap className="size-3.5 fill-current" />
                                Xtreme Finish
                            </span>
                            <span className="text-[10px] font-normal opacity-90">
                                +3 Poin
                            </span>
                        </Button>
                    </div>

                    {/* Secondary Actions (Draw, Penalty, Walkover, Dispute) */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 text-xs font-medium"
                            onClick={handleRecordDraw}
                        >
                            <RotateCcw className="mr-1 size-3.5" />
                            <span>Draw / Rematch</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 text-xs font-medium"
                            onClick={() => handleRecordFinish('penalty_foul')}
                        >
                            <ShieldAlert className="mr-1 size-3.5 text-amber-600" />
                            <span>Penalti (+1)</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 text-xs font-medium text-destructive hover:text-destructive"
                            onClick={() => setWalkoverModalOpen(true)}
                        >
                            <UserX className="mr-1 size-3.5" />
                            <span>Walkover (WO)</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Battle Round History */}
            {match.battles && match.battles.length > 0 && (
                <div className="space-y-3 rounded-xl border bg-card p-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Swords className="size-3.5 text-primary" />
                        Riwayat Ronde Battle (Total {match.battles.length}{' '}
                        Ronde)
                    </span>
                    <div className="space-y-1.5">
                        {match.battles.map((b) => (
                            <div
                                key={b.id}
                                className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-primary">
                                        Ronde #{b.battle_number}
                                    </span>
                                    {b.is_draw ? (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px]"
                                        >
                                            Draw / Rematch (0 Pts)
                                        </Badge>
                                    ) : (
                                        <span>
                                            <span className="font-semibold">
                                                {b.winner?.display_nickname ||
                                                    b.winner?.user?.name}
                                            </span>{' '}
                                            <span className="text-[10px] text-muted-foreground uppercase">
                                                ({b.finish_type})
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono font-semibold text-foreground">
                                    {b.player1_points_after} -{' '}
                                    {b.player2_points_after}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dispute Report Button */}
            {!isCompleted && (
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={() => setDisputeModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline hover:text-destructive"
                    >
                        <AlertTriangle className="size-3" />
                        Laporkan Sengketa / Dispute Pertandingan
                    </button>
                </div>
            )}

            {/* Walkover Dialog */}
            <Dialog
                open={walkoverModalOpen}
                onOpenChange={setWalkoverModalOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <UserX className="size-5" />
                            <DialogTitle>Penetapan Walkover (WO)</DialogTitle>
                        </div>
                        <DialogDescription>
                            Tetapkan Walkover jika salah satu peserta tidak
                            hadir di arena setelah batas panggilan 3 menit
                            habis.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                        <Field name="walkover_player">
                            <FieldLabel>
                                Pemenang WO (Peserta yang Hadir)
                            </FieldLabel>
                            <select
                                value={walkoverPresentId}
                                onChange={(e) =>
                                    setWalkoverPresentId(e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                            >
                                <option value={match.player1_id || ''}>
                                    {player1Name}
                                </option>
                                <option value={match.player2_id || ''}>
                                    {player2Name}
                                </option>
                            </select>
                        </Field>

                        <Field name="walkover_reason">
                            <FieldLabel>Alasan Penetapan WO</FieldLabel>
                            <Textarea
                                value={walkoverReason}
                                onChange={(e) =>
                                    setWalkoverReason(e.target.value)
                                }
                                placeholder="Contoh: Peserta tidak hadir di Stadium setelah 3x panggilan batas waktu 180 detik."
                                rows={2}
                                required
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setWalkoverModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={submitWalkover}>
                            Tetapkan Walkover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dispute Dialog */}
            <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            <DialogTitle>
                                Laporkan Sengketa / Dispute
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Kunci sementara pertandingan ini untuk peninjauan
                            langsung oleh Head Judge / Panitia.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-xs">
                        <Field name="dispute_reason">
                            <FieldLabel>Catatan Kronologi Sengketa</FieldLabel>
                            <Textarea
                                value={disputeReason}
                                onChange={(e) =>
                                    setDisputeReason(e.target.value)
                                }
                                placeholder="Contoh: Kedua blader mengklaim putaran berhenti bersamaan (Over vs Burst bersamaan), butuh peninjauan video/keputusan Head Judge."
                                rows={3}
                                required
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDisputeModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={submitDispute}>
                            Kirim Laporan Dispute
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
