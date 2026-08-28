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
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Flame className="size-5 text-primary" />
                        Arena Stadium Pertandingan Live
                    </h3>
                    <Badge variant="outline" className="text-xs">
                        {stadiums.length} Stadium Aktif
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stadiums.map((stadium) => {
                        const isBusy = stadium.status === 'in_use';
                        const isAvailable = stadium.status === 'available';
                        const activeMatch = stadium.matches && stadium.matches[0];

                        const player1Name =
                            activeMatch?.player1?.display_nickname || activeMatch?.player1?.user?.name || 'Blader 1';
                        const player2Name =
                            activeMatch?.player2?.display_nickname || activeMatch?.player2?.user?.name || 'Blader 2';

                        return (
                            <Card
                                key={stadium.id}
                                className={`border transition-all overflow-hidden ${
                                    isBusy
                                        ? 'border-primary ring-2 ring-primary/30 bg-card shadow-md'
                                        : isAvailable
                                        ? 'border-emerald-500/30 bg-emerald-500/5'
                                        : 'border-border bg-muted/20'
                                }`}
                            >
                                <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b text-xs">
                                    <span className="font-bold text-foreground">{stadium.name}</span>
                                    <Badge
                                        variant={isBusy ? 'default' : isAvailable ? 'secondary' : 'outline'}
                                        className={isAvailable ? 'bg-emerald-600 text-white text-[10px]' : 'text-[10px]'}
                                    >
                                        {isBusy ? 'LIVE BATTLE' : isAvailable ? 'READY / TERSEDIA' : 'MAINTENANCE'}
                                    </Badge>
                                </div>

                                <CardContent className="p-4 space-y-3">
                                    {isBusy && activeMatch ? (
                                        <div className="space-y-2">
                                            <div className="text-[11px] text-muted-foreground font-semibold flex items-center justify-between">
                                                <span>{activeMatch.category?.name} • Match #{activeMatch.match_order}</span>
                                                <span className="font-mono text-primary font-bold">Target {activeMatch.category?.target_points || 4} Pts</span>
                                            </div>

                                            {/* Live Score Strip */}
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div className="rounded-lg bg-muted/50 p-2 border">
                                                    <span className="text-xs font-semibold block truncate text-foreground">{player1Name}</span>
                                                    <span className="text-2xl font-black font-mono text-primary">{activeMatch.player1_score}</span>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-2 border">
                                                    <span className="text-xs font-semibold block truncate text-foreground">{player2Name}</span>
                                                    <span className="text-2xl font-black font-mono text-primary">{activeMatch.player2_score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-xs text-muted-foreground">
                                            <Swords className="size-6 mx-auto mb-1.5 opacity-40 text-emerald-600" />
                                            <span>Stadium siap menerima panggilan match berikutnya</span>
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
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                        <Megaphone className="size-5 text-amber-600 animate-bounce" />
                        <h4 className="font-bold text-sm">Panggilan Blader ke Arena Stadium!</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {upcomingCalls.map((match) => (
                            <div
                                key={match.id}
                                className="rounded-lg bg-card border border-amber-500/20 p-3 text-xs flex items-center justify-between shadow-xs"
                            >
                                <div className="space-y-0.5">
                                    <span className="font-bold text-foreground">
                                        {match.player1?.display_nickname || match.player1?.user?.name} vs{' '}
                                        {match.player2?.display_nickname || match.player2?.user?.name}
                                    </span>
                                    <p className="text-[11px] text-muted-foreground">
                                        {match.category?.name} • Match #{match.match_order}
                                    </p>
                                </div>
                                <Badge className="bg-amber-600 hover:bg-amber-700 text-[10px]">
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
