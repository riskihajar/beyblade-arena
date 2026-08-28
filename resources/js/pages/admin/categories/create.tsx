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
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/admin/categories';
import { show as showEvent } from '@/routes/admin/events';
import { type BreadcrumbItem } from '@/types';
import { type Event, type TournamentRuleset } from '@/types/tournament';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    event: Event;
    rulesets: TournamentRuleset[];
}

export default function AdminCategoriesCreate({ event, rulesets }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Turnamen & Event', href: '/admin/events' },
        { title: event.name, href: showEvent({ event: event.id }).url },
        { title: 'Tambah Kategori', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Kategori: ${event.name}`} />

            <div className="max-w-2xl px-4 py-8">
                <Form action={store().url} method="post">
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="event_id" value={event.id} />

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
                                            <FrameTitle>Tambah Kategori Divisi</FrameTitle>
                                            <FrameDescription>
                                                Event: <span className="font-semibold text-foreground">{event.name}</span>
                                            </FrameDescription>
                                        </div>
                                    </div>
                                </FrameHeader>

                                <FramePanel>
                                    <div className="space-y-6">
                                        <Fieldset className="space-y-4">
                                            {/* Nama Kategori */}
                                            <Field name="name" data-invalid={!!errors.name || undefined}>
                                                <FieldLabel htmlFor="name">Nama Kategori Divisi</FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue=""
                                                    placeholder="Contoh: Open Master Division / Junior (U-12)"
                                                    required
                                                />
                                                <FieldError error={errors.name} />
                                            </Field>

                                            {/* Ruleset Scoring */}
                                            <Field name="ruleset_id" data-invalid={!!errors.ruleset_id || undefined}>
                                                <FieldLabel htmlFor="ruleset_id">Template Ruleset Scoring</FieldLabel>
                                                <select
                                                    id="ruleset_id"
                                                    name="ruleset_id"
                                                    defaultValue={rulesets[0]?.id || ''}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    required
                                                >
                                                    {rulesets.map((ruleset) => (
                                                        <option key={ruleset.id} value={ruleset.id}>
                                                            {ruleset.name} ({ruleset.points_to_win} Poin to Win) — Spin: {ruleset.spin_finish_points} | Over: {ruleset.over_finish_points} | Burst: {ruleset.burst_finish_points} | Xtreme: {ruleset.xtreme_finish_points}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FieldError error={errors.ruleset_id} />
                                            </Field>

                                            {/* Format & Target Poin */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field name="format" data-invalid={!!errors.format || undefined}>
                                                    <FieldLabel htmlFor="format">Format Turnamen</FieldLabel>
                                                    <select
                                                        id="format"
                                                        name="format"
                                                        defaultValue="single_elimination"
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    >
                                                        <option value="single_elimination">Single Elimination (Gugur Tunggal)</option>
                                                        <option value="double_elimination">Double Elimination (Gugur Ganda)</option>
                                                        <option value="round_robin">Round Robin (Setengah Kompetisi)</option>
                                                        <option value="custom_group_playoff">Grup Round Robin + Playoff</option>
                                                    </select>
                                                    <FieldError error={errors.format} />
                                                </Field>

                                                <Field name="target_points" data-invalid={!!errors.target_points || undefined}>
                                                    <FieldLabel htmlFor="target_points">Target Poin Kemenangan (Match Point)</FieldLabel>
                                                    <Input
                                                        id="target_points"
                                                        name="target_points"
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        defaultValue="4"
                                                        required
                                                    />
                                                    <FieldError error={errors.target_points} />
                                                </Field>
                                            </div>

                                            {/* Kuota & Batas Umur */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                <Field name="max_participants" data-invalid={!!errors.max_participants || undefined}>
                                                    <FieldLabel htmlFor="max_participants">Kuota Maksimal Peserta</FieldLabel>
                                                    <Input
                                                        id="max_participants"
                                                        name="max_participants"
                                                        type="number"
                                                        min="2"
                                                        max="512"
                                                        defaultValue="32"
                                                        required
                                                    />
                                                    <FieldError error={errors.max_participants} />
                                                </Field>

                                                <Field name="min_age" data-invalid={!!errors.min_age || undefined}>
                                                    <FieldLabel htmlFor="min_age">Batas Usia Min (Opsional)</FieldLabel>
                                                    <Input
                                                        id="min_age"
                                                        name="min_age"
                                                        type="number"
                                                        min="3"
                                                        max="99"
                                                        defaultValue=""
                                                        placeholder="Contoh: 6"
                                                    />
                                                    <FieldError error={errors.min_age} />
                                                </Field>

                                                <Field name="max_age" data-invalid={!!errors.max_age || undefined}>
                                                    <FieldLabel htmlFor="max_age">Batas Usia Maks (Opsional)</FieldLabel>
                                                    <Input
                                                        id="max_age"
                                                        name="max_age"
                                                        type="number"
                                                        min="3"
                                                        max="99"
                                                        defaultValue=""
                                                        placeholder="Contoh: 12"
                                                    />
                                                    <FieldError error={errors.max_age} />
                                                </Field>
                                            </div>

                                            {/* Deck Lock Policy & Call Timeout */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field name="deck_lock_policy" data-invalid={!!errors.deck_lock_policy || undefined}>
                                                    <FieldLabel htmlFor="deck_lock_policy">Kebijakan Penguncian Deck</FieldLabel>
                                                    <select
                                                        id="deck_lock_policy"
                                                        name="deck_lock_policy"
                                                        defaultValue="until_checkin"
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    >
                                                        <option value="until_checkin">Terkunci sejak Check-in (Strict / Kompetitif)</option>
                                                        <option value="until_top_cut">Terkunci saat Top Cut (Semi-Kompetitif)</option>
                                                        <option value="free_between_matches">Bebas Ganti Antar-Match (Casual Gathering)</option>
                                                    </select>
                                                    <FieldError error={errors.deck_lock_policy} />
                                                </Field>

                                                <Field name="call_timeout_seconds" data-invalid={!!errors.call_timeout_seconds || undefined}>
                                                    <FieldLabel htmlFor="call_timeout_seconds">Toleransi Panggilan (Detik)</FieldLabel>
                                                    <Input
                                                        id="call_timeout_seconds"
                                                        name="call_timeout_seconds"
                                                        type="number"
                                                        min="30"
                                                        max="600"
                                                        defaultValue="180"
                                                        required
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        180 detik = 3 menit (Standar Komunitas Samarinda: 3 tahapan panggilan)
                                                    </p>
                                                    <FieldError error={errors.call_timeout_seconds} />
                                                </Field>
                                            </div>
                                        </Fieldset>
                                    </div>
                                </FramePanel>
                            </Frame>

                            {/* Actions */}
                            <div className="mt-4 flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Simpan Kategori
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
