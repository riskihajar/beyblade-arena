import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type Event,
    type Registration,
    type TournamentCategory,
} from '@/types/tournament';
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
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Head title={`Podium Juara & Hasil Turnamen — ${event.name}`} />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href={`/events/${event.id}`}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Detail Event</span>
                    </Link>

                    <Badge
                        variant="secondary"
                        className="gap-1 text-xs font-bold"
                    >
                        <Trophy className="size-3.5 text-amber-500" />
                        <span>Hasil Akhir Turnamen</span>
                    </Badge>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl flex-1 space-y-12 px-4 py-10 sm:px-8">
                {/* Header Banner */}
                <div className="space-y-3 text-center">
                    <div className="mb-2 inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-4 ring-amber-500/20">
                        <Trophy className="size-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                        Podium Juara Turnamen
                    </h1>
                    <p className="mx-auto max-w-md text-sm text-muted-foreground">
                        Selamat kepada para pemenang turnamen{' '}
                        <span className="font-bold text-foreground">
                            {event.name}
                        </span>{' '}
                        di Kota Samarinda!
                    </p>
                </div>

                {/* Podium per Category */}
                <div className="space-y-12">
                    {results.map(
                        ({
                            category,
                            first_place,
                            second_place,
                            third_place,
                            total_battles,
                            finish_stats,
                        }) => (
                            <section
                                key={category.id}
                                className="space-y-8 rounded-2xl border bg-card p-6 shadow-xs sm:p-8"
                            >
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <Badge
                                            variant="secondary"
                                            className="mb-1 text-[10px] font-bold"
                                        >
                                            Divisi Kategori
                                        </Badge>
                                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                            {category.name}
                                        </h2>
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        Total {total_battles} Ronde Battle
                                    </span>
                                </div>

                                {/* 3-Tier Podium Visual */}
                                <div className="grid grid-cols-1 items-end gap-4 pt-4 sm:grid-cols-3">
                                    {/* Rank 2: Silver */}
                                    <div className="order-2 space-y-2 rounded-xl border border-slate-400/30 bg-slate-400/5 p-4 text-center sm:order-1">
                                        <div className="inline-flex size-10 items-center justify-center rounded-full bg-slate-400 text-sm font-black text-white">
                                            2
                                        </div>
                                        <span className="block text-xs font-bold text-slate-600 uppercase dark:text-slate-300">
                                            Juara 2 (Perak)
                                        </span>
                                        <h3 className="truncate text-base font-black text-foreground">
                                            {second_place?.display_nickname ||
                                                second_place?.user?.name ||
                                                'Blader'}
                                        </h3>
                                    </div>

                                    {/* Rank 1: Gold (Elevated) */}
                                    <div className="order-1 transform space-y-3 rounded-xl border-2 border-amber-500 bg-amber-500/10 p-6 text-center shadow-sm sm:order-2 sm:-translate-y-4">
                                        <div className="inline-flex size-14 items-center justify-center rounded-full bg-amber-500 text-xl font-black text-white shadow-md">
                                            <Trophy className="size-8" />
                                        </div>
                                        <span className="block text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                            CHAMPION (EMAS)
                                        </span>
                                        <h3 className="truncate text-xl font-black text-foreground">
                                            {first_place?.display_nickname ||
                                                first_place?.user?.name ||
                                                'Champion'}
                                        </h3>
                                    </div>

                                    {/* Rank 3: Bronze */}
                                    <div className="order-3 space-y-2 rounded-xl border border-amber-700/30 bg-amber-700/5 p-4 text-center sm:order-3">
                                        <div className="inline-flex size-10 items-center justify-center rounded-full bg-amber-700 text-sm font-black text-white">
                                            3
                                        </div>
                                        <span className="block text-xs font-bold text-amber-700 uppercase dark:text-amber-300">
                                            Juara 3 (Perunggu)
                                        </span>
                                        <h3 className="truncate text-base font-black text-foreground">
                                            {third_place?.display_nickname ||
                                                third_place?.user?.name ||
                                                'Blader'}
                                        </h3>
                                    </div>
                                </div>

                                {/* Battle Finish Statistics Breakdown */}
                                <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                                    <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Statistik Tipe Finish Pertandingan
                                        Divisi Ini
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-center text-xs sm:grid-cols-4">
                                        <div className="rounded-lg border bg-card p-2.5">
                                            <span className="block text-[11px] text-muted-foreground">
                                                Spin Finish
                                            </span>
                                            <span className="font-mono text-base font-bold text-foreground">
                                                {finish_stats['spin_finish'] ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="rounded-lg border bg-card p-2.5">
                                            <span className="block text-[11px] text-muted-foreground">
                                                Over Finish
                                            </span>
                                            <span className="font-mono text-base font-bold text-foreground">
                                                {finish_stats['over_finish'] ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="rounded-lg border bg-card p-2.5">
                                            <span className="block text-[11px] text-muted-foreground">
                                                Burst Finish
                                            </span>
                                            <span className="font-mono text-base font-bold text-foreground">
                                                {finish_stats['burst_finish'] ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="rounded-lg border border-red-500/30 bg-card bg-red-500/5 p-2.5">
                                            <span className="block text-[11px] font-bold text-red-600 dark:text-red-400">
                                                Xtreme Finish
                                            </span>
                                            <span className="font-mono text-base font-bold text-red-600">
                                                {finish_stats[
                                                    'xtreme_finish'
                                                ] || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ),
                    )}
                </div>
            </main>
        </div>
    );
}
