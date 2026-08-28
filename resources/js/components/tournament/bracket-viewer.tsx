import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type RoundRobinStanding, type TournamentCategory, type TournamentMatch } from '@/types/tournament';
import { CheckCircle2, Flame, ShieldAlert, Swords, Trophy, User } from 'lucide-react';

interface Props {
    category: TournamentCategory;
    matches: TournamentMatch[];
    standings?: RoundRobinStanding[] | null;
}

function getMatchBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
        case 'completed':
            return 'default';
        case 'in_progress':
        case 'called':
            return 'secondary';
        case 'disputed':
        case 'walkover':
            return 'destructive';
        default:
            return 'outline';
    }
}

export function BracketViewer({ category, matches, standings }: Props) {
    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card p-6">
                <Swords className="size-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-semibold">Bagan Belum Dibuat</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Silakan klik tombol &quot;Buat Bagan Turnamen&quot; di atas setelah peserta selesai melakukan check-in di venue.
                </p>
            </div>
        );
    }

    // If Round Robin format, render Round Robin schedule & standings
    if (category.format === 'round_robin') {
        return (
            <div className="space-y-8">
                {/* Standings Table */}
                {standings && standings.length > 0 && (
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Trophy className="size-4 text-primary" />
                            <h3 className="font-bold text-sm">Klasemen Putaran Round Robin</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="py-2 text-left w-10">Pos</th>
                                        <th className="py-2 text-left">Blader</th>
                                        <th className="py-2 text-center w-10">MP</th>
                                        <th className="py-2 text-center w-10">W</th>
                                        <th className="py-2 text-center w-10">D</th>
                                        <th className="py-2 text-center w-10">L</th>
                                        <th className="py-2 text-center w-12 font-bold text-foreground">Pts</th>
                                        <th className="py-2 text-center w-14">BP+</th>
                                        <th className="py-2 text-center w-14">BP-</th>
                                        <th className="py-2 text-center w-14 font-semibold">ΔBP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((row) => (
                                        <tr key={row.user_id} className="border-b hover:bg-muted/50">
                                            <td className="py-2.5 font-bold">
                                                <span className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] ${
                                                    row.rank === 1 ? 'bg-amber-500 text-white' : row.rank === 2 ? 'bg-slate-400 text-white' : row.rank === 3 ? 'bg-amber-700 text-white' : 'text-muted-foreground'
                                                }`}>
                                                    {row.rank}
                                                </span>
                                            </td>
                                            <td className="py-2.5 font-semibold text-foreground">{row.user_name}</td>
                                            <td className="py-2.5 text-center">{row.mp}</td>
                                            <td className="py-2.5 text-center text-emerald-600 font-medium">{row.w}</td>
                                            <td className="py-2.5 text-center">{row.d}</td>
                                            <td className="py-2.5 text-center text-destructive">{row.l}</td>
                                            <td className="py-2.5 text-center font-black text-primary text-sm">{row.points}</td>
                                            <td className="py-2.5 text-center">{row.bp_for}</td>
                                            <td className="py-2.5 text-center">{row.bp_against}</td>
                                            <td className="py-2.5 text-center font-bold">{row.bp_diff > 0 ? `+${row.bp_diff}` : row.bp_diff}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Round Robin Match Schedule by Round */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <Swords className="size-4 text-primary" />
                        Jadwal Pertandingan Putaran
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matches.map((match) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Single Elimination Bracket Tree
    const regularMatches = matches.filter((m) => m.bracket_type !== 'bronze');
    const thirdPlaceMatch = matches.find((m) => m.bracket_type === 'bronze');

    const maxRound = Math.max(...regularMatches.map((m) => m.round_number), 1);

    const rounds = [];
    for (let r = 1; r <= maxRound; r++) {
        rounds.push({
            roundNumber: r,
            title:
                r === maxRound
                    ? 'Final'
                    : r === maxRound - 1
                    ? 'Semifinal'
                    : r === maxRound - 2
                    ? 'Perempat Final'
                    : `Babak ${r}`,
            matches: regularMatches.filter((m) => m.round_number === r),
        });
    }

    return (
        <div className="space-y-8">
            <div className="overflow-x-auto pb-6">
                <div className="flex gap-8 min-w-max items-start pt-2">
                    {rounds.map((round) => (
                        <div key={round.roundNumber} className="flex flex-col gap-4 w-72 shrink-0">
                            <div className="text-center pb-2 border-b">
                                <span className="font-bold text-sm text-foreground">{round.title}</span>
                                <p className="text-[11px] text-muted-foreground">{round.matches.length} Pertandingan</p>
                            </div>
                            <div className="flex flex-col justify-around gap-6 h-full my-auto">
                                {round.matches.map((match) => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3rd Place Playoff Match */}
            {thirdPlaceMatch && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 max-w-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="size-4 text-amber-600" />
                        <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                            Perebutan Juara 3 (Third-Place Playoff)
                        </span>
                    </div>
                    <MatchCard match={thirdPlaceMatch} />
                </div>
            )}
        </div>
    );
}

function MatchCard({ match }: { match: TournamentMatch }) {
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'in_progress' || match.status === 'called';
    const isPlayer1Winner = isCompleted && match.winner_id === match.player1_id && !!match.player1_id;
    const isPlayer2Winner = isCompleted && match.winner_id === match.player2_id && !!match.player2_id;
    const isBye1 = !match.player1_id && match.player2_id && isCompleted;
    const isBye2 = match.player1_id && !match.player2_id && isCompleted;

    const player1Name = match.player1?.display_nickname || match.player1?.user?.name;
    const player2Name = match.player2?.display_nickname || match.player2?.user?.name;

    return (
        <Card
            className={`border transition-all overflow-hidden text-xs shadow-xs ${
                isLive
                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                    : isCompleted
                    ? 'border-border bg-card'
                    : 'border-border/80 bg-muted/20'
            }`}
        >
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b text-[10px]">
                <span className="font-mono font-semibold text-muted-foreground">Match #{match.match_order}</span>
                <div className="flex items-center gap-1.5">
                    {match.stadium && (
                        <span className="text-muted-foreground font-medium">{match.stadium.name}</span>
                    )}
                    <Badge variant={getMatchBadgeVariant(match.status)} className="text-[9px] px-1.5 py-0">
                        {match.status}
                    </Badge>
                </div>
            </div>

            <div className="p-2 space-y-1.5">
                {/* Player 1 Slot */}
                <div
                    className={`flex items-center justify-between rounded px-2 py-1.5 transition-colors ${
                        isPlayer1Winner
                            ? 'bg-emerald-500/10 font-bold text-emerald-950 dark:text-emerald-200'
                            : 'text-foreground'
                    }`}
                >
                    <div className="flex items-center gap-1.5 truncate">
                        <User className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                            {player1Name || (isBye1 ? '(Bye)' : 'Menunggu Pemenang')}
                        </span>
                        {isPlayer1Winner && <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />}
                    </div>
                    <span className="font-mono font-bold text-sm ml-2">{match.player1_score}</span>
                </div>

                {/* Player 2 Slot */}
                <div
                    className={`flex items-center justify-between rounded px-2 py-1.5 transition-colors ${
                        isPlayer2Winner
                            ? 'bg-emerald-500/10 font-bold text-emerald-950 dark:text-emerald-200'
                            : 'text-foreground'
                    }`}
                >
                    <div className="flex items-center gap-1.5 truncate">
                        <User className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                            {player2Name || (isBye2 ? '(Bye)' : 'Menunggu Pemenang')}
                        </span>
                        {isPlayer2Winner && <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />}
                    </div>
                    <span className="font-mono font-bold text-sm ml-2">{match.player2_score}</span>
                </div>
            </div>
        </Card>
    );
}
