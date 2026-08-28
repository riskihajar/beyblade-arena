import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Event, type Registration, type TournamentCategory } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Flame,
    Medal,
    Sparkles,
    Swords,
    Trophy,
    User,
    Zap,
} from 'lucide-react';

interface CategoryResult {
    category: TournamentCategory;
    first_place?: Registration | null;
    second_place?: Registration | null;
    third_place?: Registration | null;
    total_battles: number;
    finish_stats: Record<string, number>;
}

interface Props {
    event: Event;
    results: CategoryResult[];
}

export default function PublicEventPodium({ event, results = [] }: Props) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title={`Podium Juara & Hasil Turnamen — ${event.name}`} />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href={`/events/${event.id}`}
                        className="flex items-center gap-2 font-bold text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Detail Event</span>
                    </Link>

                    <Badge variant="secondary" className="font-bold text-xs gap-1">
                        <Trophy className="size-3.5 text-amber-500" />
                        <span>Hasil Akhir Turnamen</span>
                    </Badge>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-8 py-10 max-w-4xl space-y-12 flex-1">
                {/* Header Banner */}
                <div className="text-center space-y-3">
                    <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-4 ring-amber-500/20 mb-2">
                        <Trophy className="size-8" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                        Podium Juara Turnamen
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Selamat kepada para pemenang turnamen <span className="font-bold text-foreground">{event.name}</span> di Kota Samarinda!
                    </p>
                </div>

                {/* Podium per Category */}
                <div className="space-y-12">
                    {results.map(({ category, first_place, second_place, third_place, total_battles, finish_stats }) => (
                        <section key={category.id} className="rounded-2xl border bg-card p-6 sm:p-8 space-y-8 shadow-xs">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <Badge variant="secondary" className="text-[10px] font-bold mb-1">
                                        Divisi Kategori
                                    </Badge>
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                        {category.name}
                                    </h2>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">
                                    Total {total_battles} Ronde Battle
                                </span>
                            </div>

                            {/* 3-Tier Podium Visual */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
                                {/* Rank 2: Silver */}
                                <div className="order-2 sm:order-1 rounded-xl border border-slate-400/30 bg-slate-400/5 p-4 text-center space-y-2">
                                    <div className="inline-flex size-10 items-center justify-center rounded-full bg-slate-400 text-white font-black text-sm">
                                        2
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block uppercase">
                                        Juara 2 (Perak)
                                    </span>
                                    <h3 className="text-base font-black text-foreground truncate">
                                        {second_place?.display_nickname || second_place?.user?.name || 'Blader'}
                                    </h3>
                                </div>

                                {/* Rank 1: Gold (Elevated) */}
                                <div className="order-1 sm:order-2 rounded-xl border-2 border-amber-500 bg-amber-500/10 p-6 text-center space-y-3 shadow-sm transform sm:-translate-y-4">
                                    <div className="inline-flex size-14 items-center justify-center rounded-full bg-amber-500 text-white font-black text-xl shadow-md">
                                        <Trophy className="size-8" />
                                    </div>
                                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 block uppercase tracking-wider">
                                        CHAMPION (EMAS)
                                    </span>
                                    <h3 className="text-xl font-black text-foreground truncate">
                                        {first_place?.display_nickname || first_place?.user?.name || 'Champion'}
                                    </h3>
                                </div>

                                {/* Rank 3: Bronze */}
                                <div className="order-3 sm:order-3 rounded-xl border border-amber-700/30 bg-amber-700/5 p-4 text-center space-y-2">
                                    <div className="inline-flex size-10 items-center justify-center rounded-full bg-amber-700 text-white font-black text-sm">
                                        3
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block uppercase">
                                        Juara 3 (Perunggu)
                                    </span>
                                    <h3 className="text-base font-black text-foreground truncate">
                                        {third_place?.display_nickname || third_place?.user?.name || 'Blader'}
                                    </h3>
                                </div>
                            </div>

                            {/* Battle Finish Statistics Breakdown */}
                            <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Statistik Tipe Finish Pertandingan Divisi Ini
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                                    <div className="rounded-lg bg-card border p-2.5">
                                        <span className="text-muted-foreground block text-[11px]">Spin Finish</span>
                                        <span className="font-mono font-bold text-base text-foreground">{finish_stats['spin_finish'] || 0}</span>
                                    </div>
                                    <div className="rounded-lg bg-card border p-2.5">
                                        <span className="text-muted-foreground block text-[11px]">Over Finish</span>
                                        <span className="font-mono font-bold text-base text-foreground">{finish_stats['over_finish'] || 0}</span>
                                    </div>
                                    <div className="rounded-lg bg-card border p-2.5">
                                        <span className="text-muted-foreground block text-[11px]">Burst Finish</span>
                                        <span className="font-mono font-bold text-base text-foreground">{finish_stats['burst_finish'] || 0}</span>
                                    </div>
                                    <div className="rounded-lg bg-card border p-2.5 border-red-500/30 bg-red-500/5">
                                        <span className="text-red-600 dark:text-red-400 block text-[11px] font-bold">Xtreme Finish</span>
                                        <span className="font-mono font-bold text-base text-red-600">{finish_stats['xtreme_finish'] || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
