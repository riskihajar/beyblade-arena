import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Fieldset } from '@/components/ui/fieldset';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { show as showEvent, update } from '@/routes/admin/events';
import { type BreadcrumbItem } from '@/types';
import { type Event, type Season } from '@/types/tournament';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    event: Event;
    seasons: Season[];
}

function formatDatetimeLocal(isoStr?: string | null): string {
    if (!isoStr) return '';
    try {
        const date = new Date(isoStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
        return '';
    }
}

export default function AdminEventsEdit({ event, seasons }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Turnamen & Event', href: '/admin/events' },
        { title: event.name, href: showEvent({ event: event.id }).url },
        { title: 'Edit Event', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Event: ${event.name}`} />

            <div className="max-w-2xl px-4 py-8">
                <Form action={update({ event: event.id }).url} method="patch">
                    {({ processing, errors }) => (
                        <>
                            <Frame>
                                <FrameHeader>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            render={<Link href={showEvent({ event: event.id }).url} />}
                                        >
                                            <ArrowLeft className="size-4" />
                                        </Button>
                                        <div>
                                            <FrameTitle>Edit Event Turnamen</FrameTitle>
                                            <FrameDescription>
                                                Perbarui informasi turnamen, jadwal, status publikasi, atau peraturan.
                                            </FrameDescription>
                                        </div>
                                    </div>
                                </FrameHeader>

                                <FramePanel>
                                    <div className="space-y-6">
                                        <Fieldset className="space-y-4">
                                            {/* Nama Event */}
                                            <Field name="name" data-invalid={!!errors.name || undefined}>
                                                <FieldLabel htmlFor="name">Nama Turnamen</FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={event.name}
                                                    required
                                                />
                                                <FieldError error={errors.name} />
                                            </Field>

                                            {/* Musim Kompetisi */}
                                            <Field name="season_id" data-invalid={!!errors.season_id || undefined}>
                                                <FieldLabel htmlFor="season_id">Musim Kompetisi</FieldLabel>
                                                <select
                                                    id="season_id"
                                                    name="season_id"
                                                    defaultValue={event.season_id || ''}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <option value="">-- Tanpa Musim (Non-Liga) --</option>
                                                    {seasons.map((season) => (
                                                        <option key={season.id} value={season.id}>
                                                            {season.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FieldError error={errors.season_id} />
                                            </Field>

                                            {/* Deskripsi */}
                                            <Field name="description" data-invalid={!!errors.description || undefined}>
                                                <FieldLabel htmlFor="description">Deskripsi Turnamen</FieldLabel>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    defaultValue={event.description || ''}
                                                    rows={3}
                                                />
                                                <FieldError error={errors.description} />
                                            </Field>

                                            {/* Venue Name & City */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field name="venue_name" data-invalid={!!errors.venue_name || undefined}>
                                                    <FieldLabel htmlFor="venue_name">Nama Venue / Lokasi</FieldLabel>
                                                    <Input
                                                        id="venue_name"
                                                        name="venue_name"
                                                        defaultValue={event.venue_name}
                                                        required
                                                    />
                                                    <FieldError error={errors.venue_name} />
                                                </Field>

                                                <Field name="venue_city" data-invalid={!!errors.venue_city || undefined}>
                                                    <FieldLabel htmlFor="venue_city">Kota</FieldLabel>
                                                    <Input
                                                        id="venue_city"
                                                        name="venue_city"
                                                        defaultValue={event.venue_city}
                                                        required
                                                    />
                                                    <FieldError error={errors.venue_city} />
                                                </Field>
                                            </div>

                                            {/* Venue Address & Maps */}
                                            <Field name="venue_address" data-invalid={!!errors.venue_address || undefined}>
                                                <FieldLabel htmlFor="venue_address">Alamat Lengkap Venue</FieldLabel>
                                                <Input
                                                    id="venue_address"
                                                    name="venue_address"
                                                    defaultValue={event.venue_address || ''}
                                                />
                                                <FieldError error={errors.venue_address} />
                                            </Field>

                                            <Field name="venue_maps_url" data-invalid={!!errors.venue_maps_url || undefined}>
                                                <FieldLabel htmlFor="venue_maps_url">Link Google Maps (Opsional)</FieldLabel>
                                                <Input
                                                    id="venue_maps_url"
                                                    name="venue_maps_url"
                                                    type="url"
                                                    defaultValue={event.venue_maps_url || ''}
                                                />
                                                <FieldError error={errors.venue_maps_url} />
                                            </Field>

                                            {/* Jadwal Pendaftaran */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field
                                                    name="registration_start_at"
                                                    data-invalid={!!errors.registration_start_at || undefined}
                                                >
                                                    <FieldLabel htmlFor="registration_start_at">
                                                        Buka Pendaftaran (WITA)
                                                    </FieldLabel>
                                                    <Input
                                                        id="registration_start_at"
                                                        name="registration_start_at"
                                                        type="datetime-local"
                                                        defaultValue={formatDatetimeLocal(event.registration_start_at)}
                                                        required
                                                    />
                                                    <FieldError error={errors.registration_start_at} />
                                                </Field>

                                                <Field
                                                    name="registration_end_at"
                                                    data-invalid={!!errors.registration_end_at || undefined}
                                                >
                                                    <FieldLabel htmlFor="registration_end_at">
                                                        Tutup Pendaftaran (WITA)
                                                    </FieldLabel>
                                                    <Input
                                                        id="registration_end_at"
                                                        name="registration_end_at"
                                                        type="datetime-local"
                                                        defaultValue={formatDatetimeLocal(event.registration_end_at)}
                                                        required
                                                    />
                                                    <FieldError error={errors.registration_end_at} />
                                                </Field>
                                            </div>

                                            {/* Jadwal Pertandingan */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field
                                                    name="event_start_at"
                                                    data-invalid={!!errors.event_start_at || undefined}
                                                >
                                                    <FieldLabel htmlFor="event_start_at">
                                                        Waktu Mulai Turnamen (WITA)
                                                    </FieldLabel>
                                                    <Input
                                                        id="event_start_at"
                                                        name="event_start_at"
                                                        type="datetime-local"
                                                        defaultValue={formatDatetimeLocal(event.event_start_at)}
                                                        required
                                                    />
                                                    <FieldError error={errors.event_start_at} />
                                                </Field>

                                                <Field
                                                    name="event_end_at"
                                                    data-invalid={!!errors.event_end_at || undefined}
                                                >
                                                    <FieldLabel htmlFor="event_end_at">
                                                        Waktu Selesai (Estimasi WITA)
                                                    </FieldLabel>
                                                    <Input
                                                        id="event_end_at"
                                                        name="event_end_at"
                                                        type="datetime-local"
                                                        defaultValue={formatDatetimeLocal(event.event_end_at)}
                                                    />
                                                    <FieldError error={errors.event_end_at} />
                                                </Field>
                                            </div>

                                            {/* Biaya & Tier Multiplier */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field name="entry_fee" data-invalid={!!errors.entry_fee || undefined}>
                                                    <FieldLabel htmlFor="entry_fee">Biaya Pendaftaran (Rp)</FieldLabel>
                                                    <Input
                                                        id="entry_fee"
                                                        name="entry_fee"
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        defaultValue={Number(event.entry_fee)}
                                                        required
                                                    />
                                                    <FieldError error={errors.entry_fee} />
                                                </Field>

                                                <Field
                                                    name="tier_multiplier"
                                                    data-invalid={!!errors.tier_multiplier || undefined}
                                                >
                                                    <FieldLabel htmlFor="tier_multiplier">
                                                        Bobot Poin Ranking (Tier Multiplier)
                                                    </FieldLabel>
                                                    <select
                                                        id="tier_multiplier"
                                                        name="tier_multiplier"
                                                        defaultValue={Number(event.tier_multiplier).toFixed(2)}
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    >
                                                        <option value="1.50">Major Championship (1.5x Poin)</option>
                                                        <option value="1.00">Regular Tournament (1.0x Standar)</option>
                                                        <option value="0.50">Mini Gathering / Sparring (0.5x Poin)</option>
                                                    </select>
                                                    <FieldError error={errors.tier_multiplier} />
                                                </Field>
                                            </div>

                                            {/* Status Event */}
                                            <Field name="status" data-invalid={!!errors.status || undefined}>
                                                <FieldLabel htmlFor="status">Status Event</FieldLabel>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    defaultValue={event.status}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <option value="draft">Draf</option>
                                                    <option value="published">Dipublikasikan</option>
                                                    <option value="registration_open">Pendaftaran Dibuka</option>
                                                    <option value="registration_closed">Pendaftaran Ditutup</option>
                                                    <option value="ongoing">Sedang Berlangsung</option>
                                                    <option value="completed">Selesai</option>
                                                    <option value="cancelled">Dibatalkan</option>
                                                </select>
                                                <FieldError error={errors.status} />
                                            </Field>

                                            {/* Peraturan Khusus */}
                                            <Field
                                                name="rules_and_regulations"
                                                data-invalid={!!errors.rules_and_regulations || undefined}
                                            >
                                                <FieldLabel htmlFor="rules_and_regulations">
                                                    Peraturan & Syarat Turnamen
                                                </FieldLabel>
                                                <Textarea
                                                    id="rules_and_regulations"
                                                    name="rules_and_regulations"
                                                    defaultValue={event.rules_and_regulations || ''}
                                                    rows={4}
                                                />
                                                <FieldError error={errors.rules_and_regulations} />
                                            </Field>
                                        </Fieldset>
                                    </div>
                                </FramePanel>
                            </Frame>

                            {/* Actions */}
                            <div className="mt-4 flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Simpan Perubahan
                                </Button>
                                <Button
                                    variant="outline"
                                    render={<Link href={showEvent({ event: event.id }).url} />}
                                >
                                    Batal
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
