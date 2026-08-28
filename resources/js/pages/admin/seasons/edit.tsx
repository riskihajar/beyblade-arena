import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { index as seasonsIndex, update } from '@/routes/admin/seasons';
import { type BreadcrumbItem } from '@/types';
import { type Season } from '@/types/tournament';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Props {
    season: Season;
}

export default function AdminSeasonsEdit({ season }: Props) {
    const [isActive, setIsActive] = useState(season.is_active);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Musim Kompetisi', href: seasonsIndex().url },
        { title: `Edit: ${season.name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Musim: ${season.name}`} />

            <div className="max-w-2xl px-4 py-8">
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
                                            render={<Link href={seasonsIndex().url} />}
                                        >
                                            <ArrowLeft className="size-4" />
                                        </Button>
                                        <div>
                                            <FrameTitle>Edit Musim Kompetisi</FrameTitle>
                                            <FrameDescription>
                                                Perbarui informasi musim kompetisi dan status aktif.
                                            </FrameDescription>
                                        </div>
                                    </div>
                                </FrameHeader>

                                <FramePanel>
                                    <div className="space-y-6">
                                        <Fieldset className="space-y-4">
                                            {/* Nama Musim */}
                                            <Field name="name" data-invalid={!!errors.name || undefined}>
                                                <FieldLabel htmlFor="name">Nama Musim Kompetisi</FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={season.name}
                                                    required
                                                />
                                                <FieldError error={errors.name} />
                                            </Field>

                                            {/* Tanggal Mulai & Selesai */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field name="start_date" data-invalid={!!errors.start_date || undefined}>
                                                    <FieldLabel htmlFor="start_date">Tanggal Mulai Musim</FieldLabel>
                                                    <Input
                                                        id="start_date"
                                                        name="start_date"
                                                        type="date"
                                                        defaultValue={season.start_date.split('T')[0]}
                                                        required
                                                    />
                                                    <FieldError error={errors.start_date} />
                                                </Field>

                                                <Field name="end_date" data-invalid={!!errors.end_date || undefined}>
                                                    <FieldLabel htmlFor="end_date">Tanggal Selesai Musim</FieldLabel>
                                                    <Input
                                                        id="end_date"
                                                        name="end_date"
                                                        type="date"
                                                        defaultValue={season.end_date ? season.end_date.split('T')[0] : ''}
                                                    />
                                                    <FieldError error={errors.end_date} />
                                                </Field>
                                            </div>

                                            {/* Set as Active Season */}
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Checkbox
                                                    id="is_active"
                                                    checked={isActive}
                                                    onCheckedChange={(val) => setIsActive(!!val)}
                                                />
                                                <label
                                                    htmlFor="is_active"
                                                    className="text-sm font-medium leading-none cursor-pointer"
                                                >
                                                    Jadikan sebagai Musim Aktif saat ini
                                                </label>
                                            </div>
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
                                    render={<Link href={seasonsIndex().url} />}
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
