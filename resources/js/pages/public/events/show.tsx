import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { type Event, type TournamentCategory } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Flame,
    Info,
    Layers,
    Lock,
    MapPin,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    Users,
} from 'lucide-react';

interface Props {
    event: Event;
}

export default function PublicEventShow({ event }: Props) {
    const isRegistrationOpen =
        event.status === 'registration_open' || event.status === 'published';
    const isOngoing = event.status === 'ongoing';
    const isCompleted = event.status === 'completed';

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Head title={`${event.name} — Detail Turnamen & Pendaftaran`} />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {isOngoing && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1 font-bold text-primary"
                                render={
                                    <Link href={`/events/${event.id}/live`}>
                                        Live Hub Turnamen
                                    </Link>
                                }
                            />
                        )}
                        {isCompleted && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1 font-bold text-amber-600"
                                render={
                                    <Link href={`/events/${event.id}/podium`}>
                                        Podium & Hasil
                                    </Link>
                                }
                            />
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl flex-1 space-y-10 px-4 py-10 sm:px-8">
                {/* Event Header Banner */}
                <div className="space-y-4 rounded-2xl border bg-linear-to-b from-primary/5 to-background p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="secondary"
                            className="text-xs font-bold"
                        >
                            Tier {event.tier_multiplier}x Poin Musim
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Status: {event.status}
                        </Badge>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {event.name}
                    </h1>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {event.description ||
                            'Turnamen Beyblade X resmi Komunitas Blader Samarinda.'}
                    </p>

                    <div className="grid grid-cols-1 gap-3 pt-2 text-xs sm:grid-cols-3">
                        <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
                            <Calendar className="size-4 shrink-0 text-primary" />
                            <div>
                                <span className="block text-[10px] text-muted-foreground">
                                    Tanggal Event
                                </span>
                                <span className="font-bold text-foreground">
                                    {event.event_date}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
                            <MapPin className="size-4 shrink-0 text-primary" />
                            <div className="truncate">
                                <span className="block text-[10px] text-muted-foreground">
                                    Lokasi Venue
                                </span>
                                <span className="block truncate font-bold text-foreground">
                                    {event.venue_name || 'Kota Samarinda'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
                            <Clock className="size-4 shrink-0 text-primary" />
                            <div>
                                <span className="block text-[10px] text-muted-foreground">
                                    Periode Pendaftaran
                                </span>
                                <span className="font-bold text-foreground">
                                    {event.registration_start_date || 'Segera'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories & Registration Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Kategori Divisi Pertandingan
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Pilih divisi yang sesuai dan lakukan registrasi
                                blader secara online.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {event.categories && event.categories.length > 0 ? (
                            event.categories.map((category) => {
                                const confirmedCount =
                                    category.registrations?.filter(
                                        (r) =>
                                            r.status === 'confirmed' ||
                                            r.status === 'checked_in',
                                    ).length || 0;
                                const isQuotaFull =
                                    confirmedCount >= category.max_participants;

                                return (
                                    <Card
                                        key={category.id}
                                        className="flex flex-col justify-between border shadow-xs"
                                    >
                                        <CardHeader className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs font-semibold"
                                                >
                                                    Format:{' '}
                                                    {category.format ===
                                                    'round_robin'
                                                        ? 'Round Robin'
                                                        : 'Single Elimination'}
                                                </Badge>
                                                {category.max_age && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px]"
                                                    >
                                                        Maks {category.max_age}{' '}
                                                        Tahun
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-foreground">
                                                {category.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Target Poin Kemenangan:{' '}
                                                {category.target_points} Poin
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">
                                                        Kuota Peserta:
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {confirmedCount} /{' '}
                                                        {
                                                            category.max_participants
                                                        }{' '}
                                                        Slot
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                (confirmedCount /
                                                                    category.max_participants) *
                                                                    100,
                                                                100,
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                                                    <span>Kebijakan Deck:</span>
                                                    <span className="font-semibold text-foreground capitalize">
                                                        {category.deck_lock_policy.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {isRegistrationOpen && (
                                                <Button
                                                    className="w-full font-bold"
                                                    variant={
                                                        isQuotaFull
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                    render={
                                                        <Link
                                                            href={`/events/${event.id}/register?category_id=${category.id}`}
                                                        >
                                                            {isQuotaFull
                                                                ? 'Daftar Antrean (Waitlist)'
                                                                : 'Daftar Sekarang'}
                                                        </Link>
                                                    }
                                                />
                                            )}

                                            {isOngoing && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full gap-1.5 font-semibold"
                                                    render={
                                                        <Link
                                                            href={`/events/${event.id}/live?category_id=${category.id}`}
                                                        >
                                                            Buka Live Bagan &
                                                            Skor
                                                        </Link>
                                                    }
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Belum ada kategori yang dikonfigurasi untuk
                                event ini.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
