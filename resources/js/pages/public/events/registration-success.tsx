import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { type Registration } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    MapPin,
    QrCode,
    Share2,
    Shield,
    Swords,
    Trophy,
} from 'lucide-react';

interface Props {
    registration: Registration;
}

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return (
            new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Makassar',
            }).format(date) + ' WITA'
        );
    } catch {
        return dateStr;
    }
}

export default function PublicEventsRegistrationSuccess({
    registration,
}: Props) {
    const event = registration.event;
    const category = registration.category;
    const isConfirmed =
        registration.status === 'confirmed' ||
        registration.status === 'checked_in';

    return (
        <div className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
            <Head title="Tiket Pendaftaran Berhasil" />

            <div className="mx-auto max-w-lg space-y-6">
                {/* Success Banner */}
                <div className="space-y-2 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="size-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Pendaftaran Berhasil Diterima!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Simpan tiket ini untuk proses verifikasi & check-in di
                        venue turnamen Samarinda.
                    </p>
                </div>

                {/* Digital Ticket Card */}
                <Card className="relative overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="h-3 bg-linear-to-r from-primary via-indigo-500 to-sky-500" />

                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                E-Ticket Blader Pass
                            </span>
                            <Badge
                                variant={isConfirmed ? 'default' : 'secondary'}
                            >
                                {isConfirmed
                                    ? 'Terkonfirmasi (Confirmed)'
                                    : 'Daftar Tunggu (Waitlist)'}
                            </Badge>
                        </div>
                        <CardTitle className="mt-1 text-2xl font-black text-foreground">
                            {registration.display_nickname}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-foreground">
                            {event?.name}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 divide-y text-sm">
                        {/* Status Notice */}
                        <div className="pt-1">
                            {isConfirmed ? (
                                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <span className="font-semibold">
                                            Slot Terkonfirmasi #
                                            {registration.seed_number ?? 'Auto'}
                                        </span>
                                        <p className="mt-0.5">
                                            Harap hadir di meja registrasi venue
                                            minimal 30 menit sebelum
                                            pertandingan dimulai untuk
                                            verifikasi fisik combo deck.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                                    <Clock className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <span className="font-semibold">
                                            Posisi Waitlist
                                        </span>
                                        <p className="mt-0.5">
                                            Kuota divisi saat ini penuh. Jika
                                            ada peserta yang batal atau no-show,
                                            status Anda akan otomatis
                                            dipromosikan.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Event Details */}
                        <div className="space-y-2 pt-3 text-xs">
                            <div className="flex items-start gap-2">
                                <Trophy className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                <div>
                                    <span className="text-muted-foreground">
                                        Kategori:
                                    </span>
                                    <p className="font-semibold text-foreground">
                                        {category?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                <div>
                                    <span className="text-muted-foreground">
                                        Lokasi Venue:
                                    </span>
                                    <p className="font-semibold text-foreground">
                                        {event?.venue_name} ({event?.venue_city}
                                        )
                                    </p>
                                    <p className="text-muted-foreground">
                                        {event?.venue_address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Calendar className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                <div>
                                    <span className="text-muted-foreground">
                                        Waktu Pertandingan:
                                    </span>
                                    <p className="font-semibold text-foreground">
                                        {formatDate(event?.event_start_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Registered Deck Preview */}
                        {registration.deck_data &&
                            registration.deck_data.length > 0 && (
                                <div className="space-y-2 pt-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                        <Swords className="size-3.5 text-primary" />
                                        <span>Deck Terdaftar (3 Combo)</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {registration.deck_data.map(
                                            (combo, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs"
                                                >
                                                    <span className="font-medium text-foreground">
                                                        #{idx + 1} {combo.blade}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {combo.ratchet} •{' '}
                                                        {combo.bit}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Ticket QR/ID Code Footer */}
                        <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                            <div>
                                <p className="text-[10px] font-semibold tracking-wider uppercase">
                                    ID Registrasi
                                </p>
                                <p className="font-mono text-xs font-bold text-foreground">
                                    {registration.id}
                                </p>
                            </div>
                            <QrCode className="size-8 text-muted-foreground" />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 border-t bg-muted/10 pt-4">
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => window.print()}
                        >
                            <Download className="mr-1.5 size-4" />
                            <span>Cetak / Simpan Tiket PDF</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            render={<Link href="/" />}
                        >
                            <ArrowLeft className="mr-1.5 size-4" />
                            <span>Kembali ke Beranda</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
