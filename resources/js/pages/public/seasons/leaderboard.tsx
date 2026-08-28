import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Frame } from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type Season, type SeasonRanking } from '@/types/tournament';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Flame,
    Search,
    Sparkles,
    Swords,
    Trophy,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    seasons: Season[];
    selectedSeason?: Season | null;
    rankings: SeasonRanking[];
}

export default function PublicLeaderboard({
    seasons = [],
    selectedSeason,
    rankings = [],
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRankings = rankings.filter((r) =>
        (r.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const top1 = rankings.find((r) => r.rank_position === 1);
    const top2 = rankings.find((r) => r.rank_position === 2);
    const top3 = rankings.find((r) => r.rank_position === 3);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Head
                title={`Klasemen Leaderboard Musim — ${selectedSeason?.name || 'Liga Blader Samarinda'}`}
            />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="w-56">
                            <NativeSelect
                                value={selectedSeason?.id || ''}
                                onChange={(e) =>
                                    router.get('/leaderboard', {
                                        season_id: e.target.value,
                                    })
                                }
                            >
                                {seasons.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.is_active ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl flex-1 space-y-10 px-4 py-10 sm:px-8">
                {/* Header Banner */}
                <div className="space-y-3 text-center">
                    <Badge
                        variant="secondary"
                        className="gap-1 text-xs font-bold"
                    >
                        <Trophy className="size-3.5 text-amber-500" />
                        <span>Official Community Leaderboard</span>
                    </Badge>
                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {selectedSeason?.name ||
                            'Klasemen Liga Blader Samarinda'}
                    </h1>
                    <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
                        Akumulasi poin turnamen resmi berdasarkan partisipasi,
                        kemenangan battle match, dan penempatan podium juara
                        musim ini.
                    </p>
                </div>

                {/* Top 3 Podium Cards */}
                {rankings.length >= 3 && (
                    <div className="grid grid-cols-1 items-end gap-4 pt-2 sm:grid-cols-3">
                        {/* Rank 2 */}
                        <Card className="order-2 border-slate-400/30 bg-slate-400/5 p-4 text-center sm:order-1">
                            <CardHeader className="p-0 pb-2">
                                <div className="mx-auto inline-flex size-9 items-center justify-center rounded-full bg-slate-400 text-sm font-black text-white">
                                    2
                                </div>
                                <span className="block text-[11px] font-bold text-slate-600 uppercase dark:text-slate-300">
                                    Peringkat 2
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-1 p-0">
                                <h3 className="truncate text-base font-bold text-foreground">
                                    {top2?.user?.name}
                                </h3>
                                <span className="font-mono text-xl font-black text-primary">
                                    {top2?.total_points} Pts
                                </span>
                            </CardContent>
                        </Card>

                        {/* Rank 1 */}
                        <Card className="order-1 transform border-2 border-amber-500 bg-amber-500/10 p-6 text-center shadow-sm sm:order-2 sm:-translate-y-2">
                            <CardHeader className="p-0 pb-2">
                                <div className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-amber-500 text-lg font-black text-white shadow-md">
                                    <Trophy className="size-6" />
                                </div>
                                <span className="block text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                    LEADERBOARD #1
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-1 p-0">
                                <h3 className="truncate text-xl font-black text-foreground">
                                    {top1?.user?.name}
                                </h3>
                                <span className="font-mono text-3xl font-black text-amber-600 dark:text-amber-400">
                                    {top1?.total_points} Pts
                                </span>
                            </CardContent>
                        </Card>

                        {/* Rank 3 */}
                        <Card className="order-3 border-amber-700/30 bg-amber-700/5 p-4 text-center sm:order-3">
                            <CardHeader className="p-0 pb-2">
                                <div className="mx-auto inline-flex size-9 items-center justify-center rounded-full bg-amber-700 text-sm font-black text-white">
                                    3
                                </div>
                                <span className="block text-[11px] font-bold text-amber-700 uppercase dark:text-amber-300">
                                    Peringkat 3
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-1 p-0">
                                <h3 className="truncate text-base font-bold text-foreground">
                                    {top3?.user?.name}
                                </h3>
                                <span className="font-mono text-xl font-black text-primary">
                                    {top3?.total_points} Pts
                                </span>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Table Section with Search Filter */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <Users className="size-5 text-primary" />
                            Daftar Peringkat Blader ({
                                filteredRankings.length
                            }{' '}
                            Blader)
                        </h2>

                        <InputGroup className="w-full sm:w-64">
                            <InputGroupAddon>
                                <Search className="size-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder="Cari nama blader..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <Frame className="w-full">
                        {filteredRankings.length === 0 ? (
                            <Empty className="py-12">
                                <EmptyHeader>
                                    <Trophy className="size-8 text-muted-foreground" />
                                    <EmptyTitle>
                                        Belum ada data ranking
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        Poin ranking akan terakumulasi otomatis
                                        setelah turnamen resmi diselesaikan.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16 text-center">
                                            Pos
                                        </TableHead>
                                        <TableHead>Nama Blader</TableHead>
                                        <TableHead className="text-center">
                                            Turnamen
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Juara 1
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Match W / L
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Win Rate
                                        </TableHead>
                                        <TableHead className="text-right font-bold text-foreground">
                                            Total Poin
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRankings.map((row) => {
                                        const totalMatches =
                                            (row.matches_won || 0) +
                                            (row.matches_lost || 0);
                                        const winRate =
                                            totalMatches > 0
                                                ? Math.round(
                                                      ((row.matches_won || 0) /
                                                          totalMatches) *
                                                          100,
                                                  )
                                                : 0;

                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell className="text-center font-bold">
                                                    <span
                                                        className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                                                            row.rank_position ===
                                                            1
                                                                ? 'bg-amber-500 font-black text-white'
                                                                : row.rank_position ===
                                                                    2
                                                                  ? 'bg-slate-400 font-black text-white'
                                                                  : row.rank_position ===
                                                                      3
                                                                    ? 'bg-amber-700 font-black text-white'
                                                                    : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        #{row.rank_position}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold text-foreground">
                                                    {row.user?.name || 'Blader'}
                                                </TableCell>
                                                <TableCell className="text-center text-xs text-muted-foreground">
                                                    {row.tournaments_played}{' '}
                                                    Event
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-bold text-amber-600">
                                                    {row.tournaments_won > 0
                                                        ? `🏆 ${row.tournaments_won}x`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-xs">
                                                    <span className="font-semibold text-emerald-600">
                                                        {row.matches_won}W
                                                    </span>{' '}
                                                    /{' '}
                                                    <span className="text-muted-foreground">
                                                        {row.matches_lost}L
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-semibold">
                                                    {winRate}%
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-base font-black text-primary">
                                                    {row.total_points}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </Frame>
                </div>
            </main>
        </div>
    );
}
