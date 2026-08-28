import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type Event,
    type Season,
    type SeasonRanking,
} from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Flame,
    Layers,
    MapPin,
    Megaphone,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    User,
    Users,
    Zap,
} from 'lucide-react';

interface Props {
    upcomingEvents: Event[];
    activeSeason?: Season | null;
    topRankings?: SeasonRanking[];
}

export default function Welcome({
    upcomingEvents = [],
    activeSeason,
    topRankings = [],
}: Props) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Head title="Beyblade Arena Samarinda — Platform Turnamen & Komunitas Blader Resmi" />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 text-lg font-bold"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-amber-500 text-primary-foreground shadow-xs">
                            <Swords className="size-5" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="font-black tracking-tight">
                                BEYBLADE ARENA
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                                SAMARINDA COMMUNITY
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link
                            href="/community"
                            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:block"
                        >
                            Panduan & Komunitas
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href="/login">Masuk Blader</Link>}
                        />
                        <Button
                            size="sm"
                            render={<Link href="/register">Buat Akun</Link>}
                        />
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/5 via-background to-background py-16 sm:py-24">
                <div className="container mx-auto max-w-3xl space-y-6 px-4 text-center sm:px-8">
                    <Badge
                        variant="secondary"
                        className="gap-1.5 px-3 py-1 text-xs font-semibold"
                    >
                        <Sparkles className="size-3.5 text-primary" />
                        Platform Resmi Turnamen Beyblade X Samarinda
                    </Badge>

                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
                        Arena Pertarungan &{' '}
                        <span className="bg-linear-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                            Liga Blader Samarinda
                        </span>
                    </h1>

                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Daftar turnamen, pantau bagan eliminasi live, catat skor
                        battle secara real-time, dan raih posisi puncak klasemen
                        musim komunitas.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {upcomingEvents[0] ? (
                            <Button
                                size="lg"
                                className="gap-2 px-6 font-bold"
                                render={
                                    <Link
                                        href={`/events/${upcomingEvents[0].id}`}
                                    >
                                        Daftar Turnamen Terdekat
                                    </Link>
                                }
                            />
                        ) : (
                            <Button
                                size="lg"
                                className="gap-2 px-6 font-bold"
                                render={
                                    <Link href="/community">
                                        Pelajari Aturan Turnamen
                                    </Link>
                                }
                            />
                        )}
                        <Button
                            variant="outline"
                            size="lg"
                            render={
                                <Link href="/community">Tentang Komunitas</Link>
                            }
                        />
                    </div>
                </div>
            </section>

            {/* Main Content Sections */}
            <main className="container mx-auto flex-1 space-y-16 px-4 py-12 sm:px-8">
                {/* Upcoming Events Grid */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Turnamen & Event Mendatang
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Pilih event turnamen di Kota Samarinda dan
                                amankan slot pendaftaran Anda.
                            </p>
                        </div>
                    </div>

                    {upcomingEvents.length === 0 ? (
                        <div className="space-y-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                            <Calendar className="mx-auto size-10 text-primary opacity-40" />
                            <p className="text-sm font-semibold">
                                Belum ada jadwal turnamen aktif saat ini.
                            </p>
                            <p className="text-xs">
                                Nantikan pengumuman turnamen gathering mingguan
                                berikutnya di komunitas!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingEvents.map((event) => (
                                <Card
                                    key={event.id}
                                    className="flex flex-col justify-between border shadow-xs transition-all hover:border-primary"
                                >
                                    <CardHeader className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-bold"
                                            >
                                                Tier {event.tier_multiplier}x
                                                Poin
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                {event.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-foreground">
                                            {event.name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1 text-xs">
                                            <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                            <span className="truncate">
                                                {event.venue_name ||
                                                    'Samarinda Venue'}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>
                                                    Tanggal Pelaksanaan:
                                                </span>
                                                <span className="font-semibold text-foreground">
                                                    {event.event_date}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Kategori Divisi:</span>
                                                <span className="font-semibold text-foreground">
                                                    {event.categories?.length ||
                                                        1}{' '}
                                                    Kategori
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                className="w-full font-semibold"
                                                render={
                                                    <Link
                                                        href={`/events/${event.id}`}
                                                    >
                                                        Detail & Pendaftaran
                                                    </Link>
                                                }
                                            />
                                            {event.status === 'ongoing' && (
                                                <Button
                                                    variant="secondary"
                                                    className="shrink-0 gap-1 font-semibold text-primary"
                                                    render={
                                                        <Link
                                                            href={`/events/${event.id}/live`}
                                                        >
                                                            Live Hub
                                                        </Link>
                                                    }
                                                >
                                                    <Flame className="size-3.5" />
                                                    <span>Live</span>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Season Leaderboard Summary */}
                {activeSeason && topRankings.length > 0 && (
                    <section className="space-y-6 rounded-2xl border bg-card p-6 sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <Badge
                                    variant="secondary"
                                    className="mb-1 text-xs"
                                >
                                    Klasemen Musim Aktif
                                </Badge>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">
                                    {activeSeason.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Top Blader terbaik berdasarkan akumulasi
                                    poin turnamen resmi di Samarinda.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                            {topRankings.map((r) => (
                                <div
                                    key={r.id}
                                    className="space-y-1 rounded-xl border bg-muted/20 p-3.5 text-center"
                                >
                                    <div className="mb-1 flex items-center justify-center">
                                        <span
                                            className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-black ${
                                                r.rank === 1
                                                    ? 'bg-amber-500 text-white'
                                                    : r.rank === 2
                                                      ? 'bg-slate-400 text-white'
                                                      : r.rank === 3
                                                        ? 'bg-amber-700 text-white'
                                                        : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            #{r.rank}
                                        </span>
                                    </div>
                                    <span className="block truncate text-xs font-bold text-foreground">
                                        {r.user?.name}
                                    </span>
                                    <span className="font-mono text-sm font-black text-primary">
                                        {r.total_points} Pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Scoring Rules Summary */}
                <section className="space-y-6">
                    <div className="mx-auto max-w-xl space-y-2 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Standar Sistem Penilaian Pertarungan
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Mengikuti standar aturan resmi Beyblade X untuk
                            menjamin pertandingan yang kompetitif dan adil.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="space-y-1 rounded-xl border bg-card p-4 text-center">
                            <span className="block text-xs font-bold text-foreground">
                                Spin Finish
                            </span>
                            <span className="font-mono text-2xl font-black text-primary">
                                +1
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Putaran lawan berhenti lebih dulu di arena.
                            </p>
                        </div>

                        <div className="space-y-1 rounded-xl border bg-card p-4 text-center">
                            <span className="block text-xs font-bold text-foreground">
                                Over Finish
                            </span>
                            <span className="font-mono text-2xl font-black text-primary">
                                +2
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Blade lawan terlempar keluar ke over pocket.
                            </p>
                        </div>

                        <div className="space-y-1 rounded-xl border bg-card p-4 text-center">
                            <span className="block text-xs font-bold text-foreground">
                                Burst Finish
                            </span>
                            <span className="font-mono text-2xl font-black text-primary">
                                +2
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Blade lawan terlepas/terurai menjadi bagian
                                part.
                            </p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center">
                            <span className="block text-xs font-bold text-red-600 dark:text-red-400">
                                Xtreme Finish
                            </span>
                            <span className="font-mono text-2xl font-black text-red-600">
                                +3
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                                Blade lawan terlempar masuk ke Xtreme pocket.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer & Non-Affiliation Disclaimer */}
            <footer className="border-t bg-muted/30 py-8 text-xs text-muted-foreground">
                <div className="container mx-auto space-y-4 px-4 sm:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="font-medium text-foreground">
                            &copy; {new Date().getFullYear()} Komunitas Beyblade
                            Samarinda (KBS). Dikelola secara independen.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/community" className="hover:underline">
                                Panduan Komunitas
                            </Link>
                            <Link href="/login" className="hover:underline">
                                Portal Wasit & Juri
                            </Link>
                        </div>
                    </div>

                    <p className="border-t pt-4 text-[11px] leading-relaxed text-muted-foreground/80">
                        <strong>Disclaimer:</strong> Beyblade, Beyblade X, dan
                        logo terkait adalah merek dagang terdaftar milik TOMY
                        Company, Ltd. dan/atau Hasbro, Inc. Platform aplikasi
                        ini adalah inisiatif independen non-komersial komunitas
                        blader lokal Samarinda untuk mendukung kompetisi dan
                        turnamen olahraga hobi, dan tidak berafiliasi resmi
                        dengan Takara Tomy maupun Hasbro.
                    </p>
                </div>
            </footer>
        </div>
    );
}
