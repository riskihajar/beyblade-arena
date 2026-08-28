import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    const isRegistrationOpen = event.status === 'registration_open' || event.status === 'published';
    const isOngoing = event.status === 'ongoing';
    const isCompleted = event.status === 'completed';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title={`${event.name} — Detail Turnamen & Pendaftaran`} />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {isOngoing && (
                            <Button variant="secondary" size="sm" className="gap-1 text-primary font-bold" render={<Link href={`/events/${event.id}/live`}>Live Hub Turnamen</Link>} />
                        )}
                        {isCompleted && (
                            <Button variant="secondary" size="sm" className="gap-1 font-bold text-amber-600" render={<Link href={`/events/${event.id}/podium`}>Podium & Hasil</Link>} />
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-8 py-10 max-w-4xl space-y-10 flex-1">
                {/* Event Header Banner */}
                <div className="space-y-4 rounded-2xl border bg-linear-to-b from-primary/5 to-background p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-bold text-xs">
                            Tier {event.tier_multiplier}x Poin Musim
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Status: {event.status}
                        </Badge>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                        {event.name}
                    </h1>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description || 'Turnamen Beyblade X resmi Komunitas Blader Samarinda.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="rounded-lg bg-card border p-3 flex items-center gap-2.5">
                            <Calendar className="size-4 text-primary shrink-0" />
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Tanggal Event</span>
                                <span className="font-bold text-foreground">{event.event_date}</span>
                            </div>
                        </div>

                        <div className="rounded-lg bg-card border p-3 flex items-center gap-2.5">
                            <MapPin className="size-4 text-primary shrink-0" />
                            <div className="truncate">
                                <span className="text-muted-foreground block text-[10px]">Lokasi Venue</span>
                                <span className="font-bold text-foreground truncate block">{event.venue_name || 'Kota Samarinda'}</span>
                            </div>
                        </div>

                        <div className="rounded-lg bg-card border p-3 flex items-center gap-2.5">
                            <Clock className="size-4 text-primary shrink-0" />
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Periode Pendaftaran</span>
                                <span className="font-bold text-foreground">{event.registration_start_date || 'Segera'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories & Registration Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Kategori Divisi Pertandingan</h2>
                            <p className="text-xs text-muted-foreground">Pilih divisi yang sesuai dan lakukan registrasi blader secara online.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {event.categories && event.categories.length > 0 ? (
                            event.categories.map((category) => {
                                const confirmedCount =
                                    category.registrations?.filter((r) => r.status === 'confirmed' || r.status === 'checked_in').length || 0;
                                const isQuotaFull = confirmedCount >= category.max_participants;

                                return (
                                    <Card key={category.id} className="border flex flex-col justify-between shadow-xs">
                                        <CardHeader className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-xs font-semibold">
                                                    Format: {category.format === 'round_robin' ? 'Round Robin' : 'Single Elimination'}
                                                </Badge>
                                                {category.max_age && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        Maks {category.max_age} Tahun
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-foreground">
                                                {category.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Target Poin Kemenangan: {category.target_points} Poin
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Kuota Peserta:</span>
                                                    <span className="font-bold text-foreground">
                                                        {confirmedCount} / {category.max_participants} Slot
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                (confirmedCount / category.max_participants) * 100,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                                                    <span>Kebijakan Deck:</span>
                                                    <span className="font-semibold text-foreground capitalize">
                                                        {category.deck_lock_policy.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            {isRegistrationOpen && (
                                                <Button
                                                    className="w-full font-bold"
                                                    variant={isQuotaFull ? 'secondary' : 'default'}
                                                    render={
                                                        <Link href={`/events/${event.id}/register?category_id=${category.id}`}>
                                                            {isQuotaFull ? 'Daftar Antrean (Waitlist)' : 'Daftar Sekarang'}
                                                        </Link>
                                                    }
                                                />
                                            )}

                                            {isOngoing && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full font-semibold gap-1.5"
                                                    render={<Link href={`/events/${event.id}/live?category_id=${category.id}`}>Buka Live Bagan & Skor</Link>}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <p className="text-xs text-muted-foreground">Belum ada kategori yang dikonfigurasi untuk event ini.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
