import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BracketViewer } from '@/components/tournament/bracket-viewer';
import { StadiumCallBoard } from '@/components/tournament/stadium-call-board';
import { useTournamentRealtime } from '@/hooks/useTournamentRealtime';
import {
    type Event,
    type RoundRobinStanding,
    type Stadium,
    type TournamentCategory,
    type TournamentMatch,
} from '@/types/tournament';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Flame,
    Layers,
    Megaphone,
    RefreshCw,
    Shield,
    Swords,
    Trophy,
    User,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    event: Event;
    selectedCategory?: TournamentCategory | null;
    stadiums: Stadium[];
    matches: TournamentMatch[];
    standings?: RoundRobinStanding[] | null;
    upcomingCalls: TournamentMatch[];
}

export default function PublicLiveHub({
    event,
    selectedCategory,
    stadiums = [],
    matches = [],
    standings = null,
    upcomingCalls = [],
}: Props) {
    const [activeTab, setActiveTab] = useState<'stadiums' | 'bracket' | 'schedule'>('stadiums');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Setup Echo & Polling Realtime Hook
    useTournamentRealtime({
        eventId: event.id,
        categoryId: selectedCategory?.id,
        pollingIntervalMs: 8000,
    });

    const handleManualRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleCategoryChange = (catId: string) => {
        router.get(
            `/events/${event.id}/live`,
            { category_id: catId },
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title={`Live Hub Turnamen — ${event.name}`} />

            {/* Sticky Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href={`/events/${event.id}`}
                        className="flex items-center gap-2 font-bold text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:inline">Info Event</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                            <span className="size-2 rounded-full bg-red-600 animate-ping" />
                            <span>LIVE ARENA HUB</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="size-8 p-0"
                            title="Segarkan Data"
                        >
                            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-8 py-8 space-y-8 flex-1">
                {/* Event Name & Category Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            {event.name}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {event.venue_name || 'Kota Samarinda'} • {event.event_date}
                        </p>
                    </div>

                    {/* Category Switcher */}
                    {event.categories && event.categories.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {event.categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                        selectedCategory?.id === cat.id
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sub-Tab Navigation Bar */}
                <div className="flex items-center gap-2 border-b pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('stadiums')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'stadiums'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Flame className="size-4" />
                        <span>Papan Stadium Live</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('bracket')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'bracket'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Swords className="size-4" />
                        <span>Bagan & Klasemen</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                            activeTab === 'schedule'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Clock className="size-4" />
                        <span>Jadwal & Hasil ({matches.length})</span>
                    </button>
                </div>

                {/* Tab 1: Stadium Call Board */}
                {activeTab === 'stadiums' && (
                    <StadiumCallBoard stadiums={stadiums} upcomingCalls={upcomingCalls} />
                )}

                {/* Tab 2: Live Bracket & Standings */}
                {activeTab === 'bracket' && selectedCategory && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">
                                {selectedCategory.name} — {selectedCategory.format === 'round_robin' ? 'Klasemen Round Robin' : 'Bagan Single Elimination'}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                                Target {selectedCategory.target_points} Poin
                            </Badge>
                        </div>

                        <BracketViewer
                            category={selectedCategory}
                            matches={matches}
                            standings={standings}
                        />
                    </div>
                )}

                {/* Tab 3: Complete Schedule & Match List */}
                {activeTab === 'schedule' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground">
                            Semua Pertandingan ({matches.length} Match)
                        </h3>

                        {matches.length === 0 ? (
                            <div className="rounded-xl border p-8 text-center text-xs text-muted-foreground">
                                Belum ada pertandingan terjadwal untuk kategori ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {matches.map((m) => (
                                    <Card key={m.id} className="border text-xs p-3 space-y-2">
                                        <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                                            <span>Match #{m.match_order} • Babak {m.round_number}</span>
                                            <Badge variant={m.status === 'completed' ? 'default' : 'outline'} className="text-[9px]">
                                                {m.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`font-semibold ${m.winner_id === m.player1_id ? 'text-emerald-600 font-bold' : 'text-foreground'}`}>
                                                    {m.player1?.display_nickname || m.player1?.user?.name || 'TBD'}
                                                </span>
                                                <span className="font-mono font-bold">{m.player1_score}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className={`font-semibold ${m.winner_id === m.player2_id ? 'text-emerald-600 font-bold' : 'text-foreground'}`}>
                                                    {m.player2?.display_nickname || m.player2?.user?.name || 'TBD'}
                                                </span>
                                                <span className="font-mono font-bold">{m.player2_score}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
