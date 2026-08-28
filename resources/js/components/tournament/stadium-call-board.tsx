import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Stadium, type TournamentMatch } from '@/types/tournament';
import {
    CheckCircle2,
    Clock,
    Flame,
    Megaphone,
    Shield,
    Swords,
    Trophy,
    User,
    Zap,
} from 'lucide-react';

interface Props {
    stadiums: Stadium[];
    upcomingCalls: TournamentMatch[];
}

export function StadiumCallBoard({ stadiums, upcomingCalls }: Props) {
    return (
        <div className="space-y-8">
            {/* Live Stadium Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                        <Flame className="size-5 text-primary" />
                        Arena Stadium Pertandingan Live
                    </h3>
                    <Badge variant="outline" className="text-xs">
                        {stadiums.length} Stadium Aktif
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stadiums.map((stadium) => {
                        const isBusy = stadium.status === 'in_use';
                        const isAvailable = stadium.status === 'available';
                        const activeMatch =
                            stadium.matches && stadium.matches[0];

                        const player1Name =
                            activeMatch?.player1?.display_nickname ||
                            activeMatch?.player1?.user?.name ||
                            'Blader 1';
                        const player2Name =
                            activeMatch?.player2?.display_nickname ||
                            activeMatch?.player2?.user?.name ||
                            'Blader 2';

                        return (
                            <Card
                                key={stadium.id}
                                className={`overflow-hidden border transition-all ${
                                    isBusy
                                        ? 'border-primary bg-card shadow-md ring-2 ring-primary/30'
                                        : isAvailable
                                          ? 'border-emerald-500/30 bg-emerald-500/5'
                                          : 'border-border bg-muted/20'
                                }`}
                            >
                                <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs">
                                    <span className="font-bold text-foreground">
                                        {stadium.name}
                                    </span>
                                    <Badge
                                        variant={
                                            isBusy
                                                ? 'default'
                                                : isAvailable
                                                  ? 'success'
                                                  : 'outline'
                                        }
                                        size="sm"
                                    >
                                        {isBusy
                                            ? 'LIVE BATTLE'
                                            : isAvailable
                                              ? 'READY / TERSEDIA'
                                              : 'MAINTENANCE'}
                                    </Badge>
                                </div>

                                <CardContent className="space-y-3 p-4">
                                    {isBusy && activeMatch ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                                                <span>
                                                    {activeMatch.category?.name}{' '}
                                                    • Match #
                                                    {activeMatch.match_order}
                                                </span>
                                                <span className="font-mono font-bold text-primary">
                                                    Target{' '}
                                                    {activeMatch.category
                                                        ?.target_points ||
                                                        4}{' '}
                                                    Pts
                                                </span>
                                            </div>

                                            {/* Live Score Strip */}
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div className="rounded-lg border bg-muted/50 p-2">
                                                    <span className="block truncate text-xs font-semibold text-foreground">
                                                        {player1Name}
                                                    </span>
                                                    <span className="font-mono text-2xl font-black text-primary">
                                                        {
                                                            activeMatch.player1_score
                                                        }
                                                    </span>
                                                </div>
                                                <div className="rounded-lg border bg-muted/50 p-2">
                                                    <span className="block truncate text-xs font-semibold text-foreground">
                                                        {player2Name}
                                                    </span>
                                                    <span className="font-mono text-2xl font-black text-primary">
                                                        {
                                                            activeMatch.player2_score
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-xs text-muted-foreground">
                                            <Swords className="mx-auto mb-1.5 size-6 text-emerald-600 opacity-40" />
                                            <span>
                                                Stadium siap menerima panggilan
                                                match berikutnya
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming / Called Matches Banner */}
            {upcomingCalls.length > 0 && (
                <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                        <Megaphone className="size-5 animate-bounce text-amber-600" />
                        <h4 className="text-sm font-bold">
                            Panggilan Blader ke Arena Stadium!
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                        {upcomingCalls.map((match) => (
                            <div
                                key={match.id}
                                className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-card p-3 text-xs shadow-xs"
                            >
                                <div className="space-y-0.5">
                                    <span className="font-bold text-foreground">
                                        {match.player1?.display_nickname ||
                                            match.player1?.user?.name}{' '}
                                        vs{' '}
                                        {match.player2?.display_nickname ||
                                            match.player2?.user?.name}
                                    </span>
                                    <p className="text-[11px] text-muted-foreground">
                                        {match.category?.name} • Match #
                                        {match.match_order}
                                    </p>
                                </div>
                                <Badge variant="warning" size="sm">
                                    {match.stadium?.name || 'Stadium Arena'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
