import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Fieldset } from '@/components/ui/fieldset';
import { Frame, FrameHeader, FramePanel, FrameTitle } from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import { store } from '@/routes/public/events/register';
import { type BeyCombo, type Event } from '@/types/tournament';
import { Form, Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    MapPin,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    event: Event;
    user?: {
        id: string;
        name: string;
        email: string;
    } | null;
}

const COMMON_BLADES = [
    'Dran Sword',
    'Hells Scythe',
    'Wizard Arrow',
    'Knight Shield',
    'Viper Tail',
    'Leon Claw',
    'Rhino Horn',
    'Dran Dagger',
    'Hells Chain',
    'Phoenix Wing',
    'Wyvern Gale',
    'Unicorn Sting',
    'Sphinx Cowl',
    'Dran Buster',
    'Hells Hammer',
    'Wizard Rod',
    'Tyranno Beat',
    'Cobalt Dragoon',
    'Black Shell',
    'Aerodisk',
    'Silver Wolf',
    'Whale Wave',
];

const COMMON_RATCHETS = ['1-60', '2-60', '3-60', '4-60', '5-60', '1-80', '2-80', '3-80', '4-80', '5-80', '3-70', '5-70', '7-60', '9-60', '9-70', '9-80'];

const COMMON_BITS = ['Flat (F)', 'Taper (T)', 'Ball (B)', 'Needle (N)', 'Point (P)', 'High Flat (HF)', 'High Needle (HN)', 'Gear Flat (GF)', 'Gear Point (GP)', 'Gear Ball (GB)', 'Gear Needle (GN)', 'Orb (O)', 'Quake (Q)', 'Rubber Accel (RA)', 'Hexa (H)', 'Rush (R)', 'Elevate (E)', 'Glide (G)', 'Disc Ball (DB)'];

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Makassar',
        }).format(date) + ' WITA';
    } catch {
        return dateStr;
    }
}

function formatCurrency(amount: string | number): string {
    const num = Number(amount);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

export default function PublicEventsRegister({ event, user }: Props) {
    const categories = event.categories || [];
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
    const [age, setAge] = useState<number | ''>('');
    const [agreeRules, setAgreeRules] = useState(false);
    const [agreeMedia, setAgreeMedia] = useState(false);

    // 3 Beyblade Deck Slots
    const [deck, setDeck] = useState<BeyCombo[]>([
        { blade: 'Dran Sword', ratchet: '3-60', bit: 'Flat (F)' },
        { blade: 'Hells Scythe', ratchet: '4-60', bit: 'Ball (B)' },
        { blade: 'Wizard Rod', ratchet: '5-70', bit: 'Hexa (H)' },
    ]);

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const isJunior = (typeof age === 'number' && age < 13) || (selectedCategory?.max_age !== undefined && selectedCategory.max_age !== null && selectedCategory.max_age <= 12);

    const updateDeckSlot = (index: number, field: keyof BeyCombo, value: string) => {
        setDeck((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6">
            <Head title={`Pendaftaran: ${event.name}`} />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header & Back */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                    <Badge variant="outline" className="text-xs">
                        Komunitas Beyblade Samarinda
                    </Badge>
                </div>

                {/* Event Summary Banner Card */}
                <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-card to-card shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="default" className="text-xs font-semibold">
                                Registrasi Resmi
                            </Badge>
                            {event.season && (
                                <Badge variant="outline" className="text-xs">
                                    {event.season.name} (Tier {event.tier_multiplier}x)
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-2">
                            {event.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {event.description || 'Pendaftaran resmi turnamen Beyblade X Komunitas Samarinda.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 pt-0 sm:grid-cols-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="size-4 text-primary shrink-0" />
                            <div>
                                <span className="font-medium text-foreground">{event.venue_name}</span>
                                <p>{event.venue_address || event.venue_city}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="size-4 text-primary shrink-0" />
                            <div>
                                <span className="font-medium text-foreground">{formatDate(event.event_start_at)}</span>
                                <p>Biaya: {formatCurrency(event.entry_fee)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Registration Form */}
                <Form
                    action={store({ event: event.id }).url}
                    method="post"
                    transform={(data) => ({
                        ...data,
                        category_id: selectedCategoryId,
                        age: age === '' ? undefined : age,
                        deck_data: deck,
                        agree_rules: agreeRules,
                        agree_media_release: agreeMedia,
                    })}
                >
                    {({ processing, errors }) => (
                        <div className="space-y-6">
                            {/* 1. Pilih Kategori Divisi */}
                            <Frame>
                                <FrameHeader>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="size-4 text-primary" />
                                        <FrameTitle>1. Pilih Kategori Divisi</FrameTitle>
                                    </div>
                                </FrameHeader>
                                <FramePanel className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {categories.map((cat) => {
                                            const isSelected = cat.id === selectedCategoryId;
                                            return (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategoryId(cat.id)}
                                                    className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'border-border bg-card hover:border-primary/50'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {cat.name}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className="size-4 text-primary shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Format: {cat.format} • Target: {cat.target_points} Poin
                                                    </p>
                                                    {cat.min_age && cat.max_age && (
                                                        <Badge variant="secondary" className="mt-2 text-[10px]">
                                                            Usia {cat.min_age} - {cat.max_age} Thn
                                                        </Badge>
                                                    )}
                                                    <p className="text-[11px] text-muted-foreground mt-2">
                                                        Maks. {cat.max_participants} Peserta
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <FieldError error={errors.category_id} />
                                </FramePanel>
                            </Frame>

                            {/* 2. Informasi Blader */}
                            <Frame>
                                <FrameHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-primary" />
                                        <FrameTitle>2. Data Identitas Blader</FrameTitle>
                                    </div>
                                </FrameHeader>
                                <FramePanel className="space-y-4">
                                    <Fieldset className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Field name="name" data-invalid={!!errors.name || undefined}>
                                                <FieldLabel htmlFor="name">Nama Lengkap Blader</FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={user?.name || ''}
                                                    placeholder="Nama sesuai KTP/Kartu Pelajar"
                                                    required
                                                />
                                                <FieldError error={errors.name} />
                                            </Field>

                                            <Field name="display_nickname" data-invalid={!!errors.display_nickname || undefined}>
                                                <FieldLabel htmlFor="display_nickname">Nickname Panggilan di Bagan</FieldLabel>
                                                <Input
                                                    id="display_nickname"
                                                    name="display_nickname"
                                                    defaultValue=""
                                                    placeholder="Contoh: KuroX / Valsh"
                                                    required
                                                />
                                                <FieldError error={errors.display_nickname} />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Field name="email" data-invalid={!!errors.email || undefined}>
                                                <FieldLabel htmlFor="email">Email Aktif (Tiket & Notifikasi)</FieldLabel>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    defaultValue={user?.email || ''}
                                                    placeholder="blader@example.com"
                                                    required
                                                />
                                                <FieldError error={errors.email} />
                                            </Field>

                                            <Field name="age" data-invalid={!!errors.age || undefined}>
                                                <FieldLabel htmlFor="age">Usia Blader (Tahun)</FieldLabel>
                                                <Input
                                                    id="age"
                                                    name="age"
                                                    type="number"
                                                    min="3"
                                                    max="99"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                                                    placeholder="Contoh: 14"
                                                    required
                                                />
                                                <FieldError error={errors.age} />
                                            </Field>
                                        </div>
                                    </Fieldset>
                                </FramePanel>
                            </Frame>

                            {/* 3. Data Wali (Wajib Jika Peserta Junior/Anak) */}
                            {isJunior && (
                                <Frame className="border-amber-500/30 bg-amber-500/5">
                                    <FrameHeader>
                                        <div className="flex items-center gap-2">
                                            <Shield className="size-4 text-amber-600" />
                                            <div>
                                                <FrameTitle className="text-amber-900 dark:text-amber-200">
                                                    3. Data Orang Tua / Wali (Peserta Junior)
                                                </FrameTitle>
                                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                                    Wajib diisi untuk pendampingan anak di bawah 13 tahun saat turnamen di venue Samarinda. Data terlindungi aman dan tidak ditampilkan ke publik.
                                                </p>
                                            </div>
                                        </div>
                                    </FrameHeader>
                                    <FramePanel className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <Field name="guardian_name" data-invalid={!!errors.guardian_name || undefined}>
                                                <FieldLabel htmlFor="guardian_name">Nama Orang Tua / Wali</FieldLabel>
                                                <Input
                                                    id="guardian_name"
                                                    name="guardian_name"
                                                    defaultValue=""
                                                    placeholder="Nama Orang Tua/Wali"
                                                    required
                                                />
                                                <FieldError error={errors.guardian_name} />
                                            </Field>

                                            <Field name="guardian_phone" data-invalid={!!errors.guardian_phone || undefined}>
                                                <FieldLabel htmlFor="guardian_phone">No. HP / WhatsApp Wali</FieldLabel>
                                                <Input
                                                    id="guardian_phone"
                                                    name="guardian_phone"
                                                    type="tel"
                                                    defaultValue=""
                                                    placeholder="0812xxxxxxxx"
                                                    required
                                                />
                                                <FieldError error={errors.guardian_phone} />
                                            </Field>

                                            <Field name="guardian_relationship" data-invalid={!!errors.guardian_relationship || undefined}>
                                                <FieldLabel htmlFor="guardian_relationship">Hubungan Keluarga</FieldLabel>
                                                <Input
                                                    id="guardian_relationship"
                                                    name="guardian_relationship"
                                                    defaultValue="Orang Tua"
                                                    placeholder="Ayah / Ibu / Wali"
                                                    required
                                                />
                                                <FieldError error={errors.guardian_relationship} />
                                            </Field>
                                        </div>
                                    </FramePanel>
                                </Frame>
                            )}

                            {/* 4. Registrasi 3-Deck Beyblade Combo */}
                            <Frame>
                                <FrameHeader>
                                    <div className="flex items-center gap-2">
                                        <Swords className="size-4 text-primary" />
                                        <div>
                                            <FrameTitle>3. Deck Beyblade X (3 Combo Tanpa Part Duplikat)</FrameTitle>
                                            <p className="text-xs text-muted-foreground">
                                                Daftarkan combo 3 Beyblade Anda. Deck akan diverifikasi juri saat check-in di venue.
                                            </p>
                                        </div>
                                    </div>
                                </FrameHeader>
                                <FramePanel className="space-y-4">
                                    {deck.map((combo, idx) => (
                                        <div key={idx} className="rounded-lg border bg-card p-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-primary">
                                                    Slot #{idx + 1}
                                                </span>
                                                <Badge variant="outline" className="text-[10px]">
                                                    Beyblade {idx + 1}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                <div>
                                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                                        Blade
                                                    </label>
                                                    <input
                                                        type="text"
                                                        list={`blades-${idx}`}
                                                        value={combo.blade}
                                                        onChange={(e) => updateDeckSlot(idx, 'blade', e.target.value)}
                                                        className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        placeholder="Pilih/Ketik Blade"
                                                        required
                                                    />
                                                    <datalist id={`blades-${idx}`}>
                                                        {COMMON_BLADES.map((b) => (
                                                            <option key={b} value={b} />
                                                        ))}
                                                    </datalist>
                                                </div>

                                                <div>
                                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                                        Ratchet
                                                    </label>
                                                    <input
                                                        type="text"
                                                        list={`ratchets-${idx}`}
                                                        value={combo.ratchet}
                                                        onChange={(e) => updateDeckSlot(idx, 'ratchet', e.target.value)}
                                                        className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        placeholder="Pilih/Ketik Ratchet"
                                                        required
                                                    />
                                                    <datalist id={`ratchets-${idx}`}>
                                                        {COMMON_RATCHETS.map((r) => (
                                                            <option key={r} value={r} />
                                                        ))}
                                                    </datalist>
                                                </div>

                                                <div>
                                                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                                        Bit
                                                    </label>
                                                    <input
                                                        type="text"
                                                        list={`bits-${idx}`}
                                                        value={combo.bit}
                                                        onChange={(e) => updateDeckSlot(idx, 'bit', e.target.value)}
                                                        className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        placeholder="Pilih/Ketik Bit"
                                                        required
                                                    />
                                                    <datalist id={`bits-${idx}`}>
                                                        {COMMON_BITS.map((bt) => (
                                                            <option key={bt} value={bt} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </FramePanel>
                            </Frame>

                            {/* 5. Persetujuan & Syarat */}
                            <Frame>
                                <FrameHeader>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary" />
                                        <FrameTitle>4. Persetujuan & Komitmen Turnamen</FrameTitle>
                                    </div>
                                </FrameHeader>
                                <FramePanel className="space-y-3">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="agree_rules"
                                            checked={agreeRules}
                                            onCheckedChange={(val) => setAgreeRules(!!val)}
                                        />
                                        <label
                                            htmlFor="agree_rules"
                                            className="text-xs font-medium leading-normal cursor-pointer"
                                        >
                                            Saya menyetujui seluruh Peraturan Resmi Turnamen Komunitas Beyblade Samarinda dan menghormati keputusan mutlak Juri/Wasit.
                                        </label>
                                    </div>
                                    <FieldError error={errors.agree_rules} />

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="agree_media_release"
                                            checked={agreeMedia}
                                            onCheckedChange={(val) => setAgreeMedia(!!val)}
                                        />
                                        <label
                                            htmlFor="agree_media_release"
                                            className="text-xs font-medium leading-normal cursor-pointer"
                                        >
                                            Saya mengizinkan dokumentasi foto dan video pertandingan untuk dipublikasikan pada media resmi komunitas.
                                        </label>
                                    </div>
                                    <FieldError error={errors.agree_media_release} />
                                </FramePanel>
                            </Frame>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full text-base font-semibold"
                                    disabled={processing || !agreeRules || !agreeMedia}
                                >
                                    {processing ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran Turnamen'}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    Setelah submit, Anda akan mendapatkan nomor tiket pendaftaran resmi.
                                </p>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
}
