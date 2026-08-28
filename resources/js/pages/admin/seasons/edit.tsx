import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { exportLeaderboard } from '@/routes/admin/seasons';
import { index as seasonsIndex, update } from '@/routes/admin/seasons';
import { type BreadcrumbItem } from '@/types';
import { type Season, type SeasonRanking } from '@/types/tournament';
import { Form, Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Plus,
    RefreshCw,
    Sliders,
    Trophy,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    season: Season;
    rankings?: SeasonRanking[];
}

export default function AdminSeasonsEdit({ season, rankings = [] }: Props) {
    const [isActive, setIsActive] = useState(season.is_active);
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [adjustUserId, setAdjustUserId] = useState('');
    const [adjustPoints, setAdjustPoints] = useState(10);
    const [adjustReason, setAdjustReason] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Musim Kompetisi', href: seasonsIndex().url },
        { title: `Edit: ${season.name}`, href: '#' },
    ];

    const handleRecalculate = () => {
        if (
            !confirm(
                `Kalkulasi ulang seluruh poin ranking untuk musim '${season.name}'?`,
            )
        )
            return;

        setIsRecalculating(true);
        router.post(
            `/admin/seasons/${season.id}/recalculate`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsRecalculating(false),
            },
        );
    };

    const submitAdjustPoints = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustUserId || !adjustReason.trim()) return;

        router.post(
            `/admin/seasons/${season.id}/adjust-points`,
            {
                user_id: adjustUserId,
                points: adjustPoints,
                reason: adjustReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustModalOpen(false);
                    setAdjustReason('');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Musim: ${season.name}`} />

            <div className="container mx-auto max-w-4xl space-y-10 px-4 py-8">
                {/* Form Edit Musim */}
                <div className="max-w-2xl">
                    <Form
                        action={update({ season: season.id }).url}
                        method="patch"
                        transform={(data) => ({
                            ...data,
                            is_active: isActive,
                        })}
                    >
                        {({ processing, errors }) => (
                            <>
                                <Frame>
                                    <FrameHeader>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                render={
                                                    <Link
                                                        href={
                                                            seasonsIndex().url
                                                        }
                                                    />
                                                }
                                            >
                                                <ArrowLeft className="size-4" />
                                            </Button>
                                            <div>
                                                <FrameTitle>
                                                    Edit Musim Kompetisi
                                                </FrameTitle>
                                                <FrameDescription>
                                                    Perbarui informasi musim
                                                    kompetisi dan status aktif.
                                                </FrameDescription>
                                            </div>
                                        </div>
                                    </FrameHeader>

                                    <FramePanel>
                                        <div className="space-y-6">
                                            <Fieldset className="space-y-4">
                                                {/* Nama Musim */}
                                                <Field
                                                    name="name"
                                                    data-invalid={
                                                        !!errors.name ||
                                                        undefined
                                                    }
                                                >
                                                    <FieldLabel htmlFor="name">
                                                        Nama Musim Kompetisi
                                                    </FieldLabel>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        defaultValue={
                                                            season.name
                                                        }
                                                        required
                                                    />
                                                    <FieldError
                                                        error={errors.name}
                                                    />
                                                </Field>

                                                {/* Tanggal Mulai & Selesai */}
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <Field
                                                        name="start_date"
                                                        data-invalid={
                                                            !!errors.start_date ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="start_date">
                                                            Tanggal Mulai Musim
                                                        </FieldLabel>
                                                        <Input
                                                            id="start_date"
                                                            name="start_date"
                                                            type="date"
                                                            defaultValue={
                                                                season.start_date.split(
                                                                    'T',
                                                                )[0]
                                                            }
                                                            required
                                                        />
                                                        <FieldError
                                                            error={
                                                                errors.start_date
                                                            }
                                                        />
                                                    </Field>

                                                    <Field
                                                        name="end_date"
                                                        data-invalid={
                                                            !!errors.end_date ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="end_date">
                                                            Tanggal Selesai
                                                            Musim
                                                        </FieldLabel>
                                                        <Input
                                                            id="end_date"
                                                            name="end_date"
                                                            type="date"
                                                            defaultValue={
                                                                season.end_date.split(
                                                                    'T',
                                                                )[0]
                                                            }
                                                            required
                                                        />
                                                        <FieldError
                                                            error={
                                                                errors.end_date
                                                            }
                                                        />
                                                    </Field>
                                                </div>

                                                {/* Deskripsi */}
                                                <Field
                                                    name="description"
                                                    data-invalid={
                                                        !!errors.description ||
                                                        undefined
                                                    }
                                                >
                                                    <FieldLabel htmlFor="description">
                                                        Deskripsi Musim
                                                    </FieldLabel>
                                                    <Input
                                                        id="description"
                                                        name="description"
                                                        defaultValue={
                                                            season.description ||
                                                            ''
                                                        }
                                                    />
                                                    <FieldError
                                                        error={
                                                            errors.description
                                                        }
                                                    />
                                                </Field>

                                                {/* Checkbox Status Aktif */}
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Checkbox
                                                        id="is_active"
                                                        checked={isActive}
                                                        onCheckedChange={(
                                                            val,
                                                        ) => setIsActive(!!val)}
                                                    />
                                                    <FieldLabel
                                                        htmlFor="is_active"
                                                        className="cursor-pointer font-normal"
                                                    >
                                                        Jadikan musim ini
                                                        sebagai musim aktif saat
                                                        ini
                                                    </FieldLabel>
                                                </div>
                                            </Fieldset>
                                        </div>
                                    </FramePanel>
                                </Frame>

                                <div className="mt-4 flex gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Simpan Perubahan
                                    </Button>
                                    <Button
                                        variant="outline"
                                        render={
                                            <Link href={seasonsIndex().url}>
                                                Batal
                                            </Link>
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Season Ranking Management Section */}
                <div className="space-y-4 border-t pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                                <Trophy className="size-5 text-primary" />
                                <span>
                                    Klasemen Poin Musim ({rankings.length}{' '}
                                    Blader Terdaftar)
                                </span>
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Kelola poin ranking atau picu kalkulasi ulang
                                berbasis hasil turnamen resmi.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRecalculate}
                                disabled={isRecalculating}
                                className="gap-1.5 text-xs font-semibold"
                            >
                                <RefreshCw
                                    className={`size-3.5 ${isRecalculating ? 'animate-spin' : ''}`}
                                />
                                <span>Kalkulasi Ulang Musim</span>
                            </Button>

                            <a
                                href={`/admin/seasons/${season.id}/export-leaderboard`}
                                className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold hover:bg-muted"
                            >
                                <Download className="size-3.5" />
                                <span>Ekspor CSV</span>
                            </a>
                        </div>
                    </div>

                    <Frame className="w-full">
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
                                    <TableHead className="text-right font-bold text-foreground">
                                        Total Poin
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rankings.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-6 text-center text-xs text-muted-foreground"
                                        >
                                            Belum ada ranking blader. Klik
                                            &quot;Kalkulasi Ulang Musim&quot;
                                            setelah event selesai.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rankings.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="text-center font-mono text-xs font-bold">
                                                #{r.rank_position}
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold text-foreground">
                                                {r.user?.name}
                                            </TableCell>
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {r.tournaments_played}x
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-bold text-amber-600">
                                                {r.tournaments_won > 0
                                                    ? `🏆 ${r.tournaments_won}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-xs">
                                                <span className="text-emerald-600">
                                                    {r.matches_won}W
                                                </span>{' '}
                                                / {r.matches_lost}L
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm font-black text-primary">
                                                {r.total_points} Pts
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Frame>
                </div>
            </div>
        </AppLayout>
    );
}
