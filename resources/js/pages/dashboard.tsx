import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Frame } from '@/components/ui/frame';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import {
    create as eventsCreate,
    index as eventsIndex,
    show as eventsShow,
} from '@/routes/admin/events';
import { index as rulesetsIndex } from '@/routes/admin/rulesets';
import { index as seasonsIndex } from '@/routes/admin/seasons';
import { type BreadcrumbItem } from '@/types';
import {
    type Event,
    type Season,
    type SeasonRanking,
} from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    ExternalLink,
    Flame,
    Layers,
    LayoutGrid,
    Megaphone,
    Plus,
    Radio,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    UserCheck,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    active_events: number;
    total_events: number;
    total_bladers: number;
    active_matches: number;
    active_stadiums: number;
    total_battles: number;
}

interface Props {
    stats: DashboardStats;
    activeEvent?: Event | null;
    recentEvents: Event[];
    activeSeason?: Season | null;
    topRankings: SeasonRanking[];
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'ongoing':
            return (
                <Badge className="animate-pulse gap-1 bg-emerald-600 font-bold text-white">
                    <Radio className="size-3" />
                    <span>Live Ongoing</span>
                </Badge>
            );
        case 'registration_open':
            return (
                <Badge className="bg-blue-600 font-semibold text-white">
                    Pendaftaran Dibuka
                </Badge>
            );
        case 'registration_closed':
            return (
                <Badge variant="secondary" className="font-semibold">
                    Pendaftaran Ditutup
                </Badge>
            );
        case 'completed':
            return (
                <Badge
                    variant="outline"
                    className="font-semibold text-muted-foreground"
                >
                    Selesai
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="font-semibold capitalize">
                    {status}
                </Badge>
            );
    }
}

export default function Dashboard({
    stats,
    activeEvent,
    recentEvents = [],
    activeSeason,
    topRankings = [],
}: Props) {
    const statsCards = [
        {
            title: 'Turnamen Aktif',
            value: stats.active_events,
            icon: Trophy,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            description: `${stats.total_events} total turnamen dibuat`,
            highlight: stats.active_events > 0,
        },
        {
            title: 'Total Blader Terdaftar',
            value: stats.total_bladers,
            icon: Users,
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            description: 'Komunitas aktif Samarinda',
        },
        {
            title: 'Match Sedang Tanding',
            value: stats.active_matches,
            icon: Swords,
            color: 'text-red-500 bg-red-500/10 border-red-500/20',
            description: `${stats.total_battles} ronde battle tercatat`,
            highlight: stats.active_matches > 0,
        },
        {
            title: 'Arena Stadium Aktif',
            value: stats.active_stadiums,
            icon: Flame,
            color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            description: 'Stadium arena terkunci',
        },
    ];

    const quickActions = [
        {
            title: 'Buat Turnamen',
            description: 'Rilis event & kategori baru',
            href: eventsCreate().url,
            icon: Plus,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
        },
        {
            title: 'Fast Check-in',
            description: 'Meja registrasi & kunci deck',
            href: '/admin/checkin',
            icon: UserCheck,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
        },
        {
            title: 'Arena & Panggilan',
            description: 'Panggil match ke stadium',
            href: '/admin/stadiums',
            icon: Megaphone,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
        },
        {
            title: 'Konsol Wasit & Juri',
            description: 'Papan skor sentuh live',
            href: '/judge/console',
            icon: Shield,
            color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
        },
        {
            title: 'Ruleset Scoring',
            description: 'Konfigurasi poin battle',
            href: rulesetsIndex().url,
            icon: Layers,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
        },
        {
            title: 'Musim Kompetisi',
            description: 'Ranking & poin liga',
            href: seasonsIndex().url,
            icon: Calendar,
            color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pusat Komando Turnamen" />

            <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
                {/* Header Welcome Bar */}
                <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                <Trophy className="size-7 text-primary" />
                                <span>Beyblade Arena Command Center</span>
                            </h1>
                        </div>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Pusat kendali operasional turnamen resmi Komunitas
                            Beyblade Samarinda (KBS).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            render={<Link href={eventsCreate().url} />}
                            className="gap-1.5 font-bold shadow-xs"
                        >
                            <Plus className="size-4" />
                            <span>Buat Turnamen Baru</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href="/" />}
                            className="gap-1.5 text-xs font-semibold"
                        >
                            <ExternalLink className="size-3.5" />
                            <span>Buka Portal Publik</span>
                        </Button>
                    </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.title} className="border shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        {card.title}
                                    </span>
                                    <div
                                        className={`rounded-lg border p-2 ${card.color}`}
                                    >
                                        <Icon className="size-4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="font-mono text-3xl font-black tracking-tight text-foreground">
                                        {card.value}
                                    </div>
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        {card.highlight && (
                                            <span className="mr-1 inline-block size-2 animate-ping rounded-full bg-emerald-500" />
                                        )}
                                        {card.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions Bar */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                        Aksi Cepat Operasional (Quick Actions)
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group flex flex-col justify-between rounded-xl border bg-card p-3.5 shadow-xs transition-colors hover:bg-muted/60"
                                >
                                    <div
                                        className={`mb-2.5 flex size-8 items-center justify-center rounded-lg border ${action.color}`}
                                    >
                                        <Icon className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                                            {action.title}
                                        </h3>
                                        <p className="line-clamp-1 text-[11px] text-muted-foreground">
                                            {action.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Live Event Spotlight (If Active) */}
                {activeEvent && (
                    <Card className="border-2 border-emerald-500/40 bg-emerald-500/5 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="gap-1 bg-emerald-600 text-xs font-bold text-white">
                                            <Radio className="size-3 animate-spin" />
                                            <span>LIVE EVENT SPOTLIGHT</span>
                                        </Badge>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {activeEvent.venue_city}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-black text-foreground sm:text-2xl">
                                        {activeEvent.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Venue:{' '}
                                        <strong className="text-foreground">
                                            {activeEvent.venue_name}
                                        </strong>{' '}
                                        •{' '}
                                        {new Date(
                                            activeEvent.event_start_at,
                                        ).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </CardDescription>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                                    <Button
                                        size="sm"
                                        render={
                                            <Link
                                                href={`/events/${activeEvent.id}/live`}
                                            />
                                        }
                                        className="gap-1.5 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                    >
                                        <Radio className="size-3.5" />
                                        <span>Buka Live Hub Penonton</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        render={<Link href="/admin/stadiums" />}
                                        className="gap-1.5 text-xs font-semibold"
                                    >
                                        <Megaphone className="size-3.5" />
                                        <span>Papan Panggilan</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        {/* Stadiums running matches */}
                        {activeEvent.stadiums &&
                            activeEvent.stadiums.length > 0 && (
                                <CardContent className="border-t border-emerald-500/20 pt-2">
                                    <span className="mb-2.5 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Status Arena Stadium Live:
                                    </span>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {activeEvent.stadiums.map((stadium) => {
                                            const currentMatch =
                                                stadium.matches?.[0];
                                            const isInUse =
                                                stadium.status === 'in_use';

                                            return (
                                                <div
                                                    key={stadium.id}
                                                    className={`space-y-1.5 rounded-lg border p-3 text-xs ${
                                                        isInUse
                                                            ? 'border-emerald-500 bg-emerald-500/10'
                                                            : 'border-border bg-background'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="truncate font-bold text-foreground">
                                                            {stadium.name}
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                isInUse
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className={`text-[10px] ${isInUse ? 'bg-emerald-600' : ''}`}
                                                        >
                                                            {isInUse
                                                                ? 'BATTLE'
                                                                : 'STANDBY'}
                                                        </Badge>
                                                    </div>

                                                    {currentMatch ? (
                                                        <div className="space-y-0.5 pt-1">
                                                            <div className="flex items-center justify-between font-mono font-bold text-foreground">
                                                                <span className="truncate">
                                                                    {currentMatch
                                                                        .player1
                                                                        ?.display_nickname ||
                                                                        currentMatch
                                                                            .player1
                                                                            ?.user
                                                                            ?.name ||
                                                                        'P1'}
                                                                </span>
                                                                <span className="px-1 text-primary">
                                                                    {
                                                                        currentMatch.player1_score
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        currentMatch.player2_score
                                                                    }
                                                                </span>
                                                                <span className="truncate">
                                                                    {currentMatch
                                                                        .player2
                                                                        ?.display_nickname ||
                                                                        currentMatch
                                                                            .player2
                                                                            ?.user
                                                                            ?.name ||
                                                                        'P2'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Siap menerima
                                                            panggilan
                                                            pertandingan
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            )}
                    </Card>
                )}

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left 2 Cols: Recent Events */}
                    <div className="space-y-4 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                                <Calendar className="size-5 text-primary" />
                                <span>Turnamen & Event Terkini</span>
                            </h2>
                            <Link
                                href={eventsIndex().url}
                                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        <Frame className="w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Turnamen</TableHead>
                                        <TableHead>Venue</TableHead>
                                        <TableHead className="text-center">
                                            Tanggal
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentEvents.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-xs text-muted-foreground"
                                            >
                                                Belum ada turnamen yang dibuat.
                                                Klik &quot;Buat Turnamen
                                                Baru&quot; untuk memulai.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentEvents.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell className="text-xs font-bold text-foreground">
                                                    <Link
                                                        href={
                                                            eventsShow({
                                                                event: event.id,
                                                            }).url
                                                        }
                                                        className="hover:text-primary hover:underline"
                                                    >
                                                        {event.name}
                                                    </Link>
                                                    <span className="block text-[11px] font-normal text-muted-foreground">
                                                        {event.categories
                                                            ?.length || 0}{' '}
                                                        Kategori Divisi
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {event.venue_name}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-xs">
                                                    {new Date(
                                                        event.event_start_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        },
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(
                                                        event.status,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="icon-xs"
                                                            render={
                                                                <Link
                                                                    href={
                                                                        eventsShow(
                                                                            {
                                                                                event: event.id,
                                                                            },
                                                                        ).url
                                                                    }
                                                                />
                                                            }
                                                            title="Detail Event"
                                                        >
                                                            <ArrowRight className="size-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Frame>
                    </div>

                    {/* Right 1 Col: Top 5 Season Leaderboard */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                                <Trophy className="size-5 text-amber-500" />
                                <span>Klasemen Musim</span>
                            </h2>
                            <Link
                                href="/leaderboard"
                                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                <span>Leaderboard</span>
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        <Card className="border shadow-xs">
                            <CardHeader className="border-b pb-3">
                                <CardTitle className="flex items-center justify-between text-sm font-bold text-foreground">
                                    <span>
                                        {activeSeason?.name || 'Musim Aktif'}
                                    </span>
                                    {activeSeason?.is_active && (
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] font-bold"
                                        >
                                            Aktif
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-[11px]">
                                    Top blader dengan perolehan poin turnamen
                                    tertinggi musim ini.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-0">
                                {topRankings.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                                        Belum ada ranking blader. Poin akan
                                        terakumulasi otomatis saat event
                                        selesai.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {topRankings.map((ranking) => {
                                            const totalMatches =
                                                (ranking.matches_won || 0) +
                                                (ranking.matches_lost || 0);
                                            const winRate =
                                                totalMatches > 0
                                                    ? Math.round(
                                                          ((ranking.matches_won ||
                                                              0) /
                                                              totalMatches) *
                                                              100,
                                                      )
                                                    : 0;

                                            return (
                                                <div
                                                    key={ranking.id}
                                                    className="flex items-center justify-between p-3 text-xs transition-colors hover:bg-muted/40"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <span
                                                            className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                                                                ranking.rank_position ===
                                                                1
                                                                    ? 'bg-amber-500 text-white'
                                                                    : ranking.rank_position ===
                                                                        2
                                                                      ? 'bg-slate-400 text-white'
                                                                      : ranking.rank_position ===
                                                                          3
                                                                        ? 'bg-amber-700 text-white'
                                                                        : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {
                                                                ranking.rank_position
                                                            }
                                                        </span>
                                                        <div className="min-w-0">
                                                            <span className="block truncate font-bold text-foreground">
                                                                {ranking.user
                                                                    ?.name ||
                                                                    'Blader'}
                                                            </span>
                                                            <span className="block text-[10px] text-muted-foreground">
                                                                {
                                                                    ranking.tournaments_played
                                                                }{' '}
                                                                Turnamen •{' '}
                                                                {winRate}% WR
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <span className="font-mono text-sm font-black text-primary">
                                                            {
                                                                ranking.total_points
                                                            }
                                                        </span>
                                                        <span className="block text-[10px] text-muted-foreground">
                                                            Pts
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
