import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Event, type Season, type SeasonRanking } from '@/types/tournament';
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

export default function Welcome({ upcomingEvents = [], activeSeason, topRankings = [] }: Props) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title="Beyblade Arena Samarinda — Platform Turnamen & Komunitas Blader Resmi" />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-amber-500 text-primary-foreground shadow-xs">
                            <Swords className="size-5" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="font-black tracking-tight">BEYBLADE ARENA</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">SAMARINDA COMMUNITY</span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link href="/community" className="text-xs font-medium text-muted-foreground hover:text-foreground hidden sm:block">
                            Panduan & Komunitas
                        </Link>
                        <Button variant="outline" size="sm" render={<Link href="/login">Masuk Blader</Link>} />
                        <Button size="sm" render={<Link href="/register">Buat Akun</Link>} />
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/5 via-background to-background py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-8 text-center space-y-6 max-w-3xl">
                    <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-semibold">
                        <Sparkles className="size-3.5 text-primary" />
                        Platform Resmi Turnamen Beyblade X Samarinda
                    </Badge>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
                        Arena Pertarungan & <span className="bg-linear-to-r from-primary to-amber-500 bg-clip-text text-transparent">Liga Blader Samarinda</span>
                    </h1>

                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        Daftar turnamen, pantau bagan eliminasi live, catat skor battle secara real-time, dan raih posisi puncak klasemen musim komunitas.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {upcomingEvents[0] ? (
                            <Button size="lg" className="gap-2 font-bold px-6" render={<Link href={`/events/${upcomingEvents[0].id}`}>Daftar Turnamen Terdekat</Link>} />
                        ) : (
                            <Button size="lg" className="gap-2 font-bold px-6" render={<Link href="/community">Pelajari Aturan Turnamen</Link>} />
                        )}
                        <Button variant="outline" size="lg" render={<Link href="/community">Tentang Komunitas</Link>} />
                    </div>
                </div>
            </section>

            {/* Main Content Sections */}
            <main className="container mx-auto px-4 sm:px-8 py-12 space-y-16 flex-1">
                {/* Upcoming Events Grid */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Turnamen & Event Mendatang</h2>
                            <p className="text-sm text-muted-foreground">Pilih event turnamen di Kota Samarinda dan amankan slot pendaftaran Anda.</p>
                        </div>
                    </div>

                    {upcomingEvents.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground space-y-2">
                            <Calendar className="size-10 mx-auto opacity-40 text-primary" />
                            <p className="font-semibold text-sm">Belum ada jadwal turnamen aktif saat ini.</p>
                            <p className="text-xs">Nantikan pengumuman turnamen gathering mingguan berikutnya di komunitas!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map((event) => (
                                <Card key={event.id} className="border transition-all hover:border-primary shadow-xs flex flex-col justify-between">
                                    <CardHeader className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="secondary" className="text-[10px] font-bold">
                                                Tier {event.tier_multiplier}x Poin
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px]">
                                                {event.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-foreground">
                                            {event.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-1">
                                            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate">{event.venue_name || 'Samarinda Venue'}</span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5">
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Tanggal Pelaksanaan:</span>
                                                <span className="font-semibold text-foreground">{event.event_date}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span>Kategori Divisi:</span>
                                                <span className="font-semibold text-foreground">{event.categories?.length || 1} Kategori</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                className="w-full font-semibold"
                                                render={<Link href={`/events/${event.id}`}>Detail & Pendaftaran</Link>}
                                            />
                                            {event.status === 'ongoing' && (
                                                <Button
                                                    variant="secondary"
                                                    className="shrink-0 gap-1 font-semibold text-primary"
                                                    render={<Link href={`/events/${event.id}/live`}>Live Hub</Link>}
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
                    <section className="rounded-2xl border bg-card p-6 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <Badge variant="secondary" className="text-xs mb-1">
                                    Klasemen Musim Aktif
                                </Badge>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">
                                    {activeSeason.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Top Blader terbaik berdasarkan akumulasi poin turnamen resmi di Samarinda.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                            {topRankings.map((r) => (
                                <div key={r.id} className="rounded-xl border bg-muted/20 p-3.5 text-center space-y-1">
                                    <div className="flex items-center justify-center mb-1">
                                        <span className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-black ${
                                            r.rank === 1 ? 'bg-amber-500 text-white' : r.rank === 2 ? 'bg-slate-400 text-white' : r.rank === 3 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            #{r.rank}
                                        </span>
                                    </div>
                                    <span className="font-bold text-xs truncate block text-foreground">{r.user?.name}</span>
                                    <span className="font-black text-sm font-mono text-primary">{r.total_points} Pts</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Scoring Rules Summary */}
                <section className="space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Standar Sistem Penilaian Pertarungan</h3>
                        <p className="text-xs text-muted-foreground">
                            Mengikuti standar aturan resmi Beyblade X untuk menjamin pertandingan yang kompetitif dan adil.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
                            <span className="font-bold text-xs text-foreground block">Spin Finish</span>
                            <span className="text-2xl font-black text-primary font-mono">+1</span>
                            <p className="text-[11px] text-muted-foreground">Putaran lawan berhenti lebih dulu di arena.</p>
                        </div>

                        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
                            <span className="font-bold text-xs text-foreground block">Over Finish</span>
                            <span className="text-2xl font-black text-primary font-mono">+2</span>
                            <p className="text-[11px] text-muted-foreground">Blade lawan terlempar keluar ke over pocket.</p>
                        </div>

                        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
                            <span className="font-bold text-xs text-foreground block">Burst Finish</span>
                            <span className="text-2xl font-black text-primary font-mono">+2</span>
                            <p className="text-[11px] text-muted-foreground">Blade lawan terlepas/terurai menjadi bagian part.</p>
                        </div>

                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center space-y-1">
                            <span className="font-bold text-xs text-red-600 dark:text-red-400 block">Xtreme Finish</span>
                            <span className="text-2xl font-black text-red-600 font-mono">+3</span>
                            <p className="text-[11px] text-muted-foreground">Blade lawan terlempar masuk ke Xtreme pocket.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer & Non-Affiliation Disclaimer */}
            <footer className="border-t bg-muted/30 py-8 text-xs text-muted-foreground">
                <div className="container mx-auto px-4 sm:px-8 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="font-medium text-foreground">
                            &copy; {new Date().getFullYear()} Komunitas Beyblade Samarinda (KBS). Dikelola secara independen.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/community" className="hover:underline">Panduan Komunitas</Link>
                            <Link href="/login" className="hover:underline">Portal Wasit & Juri</Link>
                        </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-t pt-4">
                        <strong>Disclaimer:</strong> Beyblade, Beyblade X, dan logo terkait adalah merek dagang terdaftar milik TOMY Company, Ltd. dan/atau Hasbro, Inc. Platform aplikasi ini adalah inisiatif independen non-komersial komunitas blader lokal Samarinda untuk mendukung kompetisi dan turnamen olahraga hobi, dan tidak berafiliasi resmi dengan Takara Tomy maupun Hasbro.
                    </p>
                </div>
            </footer>
        </div>
    );
}
