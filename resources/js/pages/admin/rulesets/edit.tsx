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
import { index as rulesetsIndex, update } from '@/routes/admin/rulesets';
import { type BreadcrumbItem } from '@/types';
import { type TournamentRuleset } from '@/types/tournament';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    ruleset: TournamentRuleset;
}

export default function AdminRulesetsEdit({ ruleset }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ruleset Scoring', href: rulesetsIndex().url },
        { title: `Edit: ${ruleset.name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Ruleset: ${ruleset.name}`} />

            <div className="max-w-2xl px-4 py-8">
                <Form
                    action={update({ ruleset: ruleset.id }).url}
                    method="patch"
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
                                                    href={rulesetsIndex().url}
                                                />
                                            }
                                        >
                                            <ArrowLeft className="size-4" />
                                        </Button>
                                        <div>
                                            <FrameTitle>
                                                Edit Template Ruleset
                                            </FrameTitle>
                                            <FrameDescription>
                                                Perbarui konfigurasi perolehan
                                                poin battle finish type.
                                            </FrameDescription>
                                        </div>
                                    </div>
                                </FrameHeader>

                                <FramePanel>
                                    <div className="space-y-6">
                                        <Fieldset className="space-y-4">
                                            {/* Nama Ruleset */}
                                            <Field
                                                name="name"
                                                data-invalid={
                                                    !!errors.name || undefined
                                                }
                                            >
                                                <FieldLabel htmlFor="name">
                                                    Nama Ruleset
                                                </FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue={ruleset.name}
                                                    required
                                                />
                                                <FieldError
                                                    error={errors.name}
                                                />
                                            </Field>

                                            {/* Generasi & Poin Menang */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field
                                                    name="generation"
                                                    data-invalid={
                                                        !!errors.generation ||
                                                        undefined
                                                    }
                                                >
                                                    <FieldLabel htmlFor="generation">
                                                        Generasi Beyblade
                                                    </FieldLabel>
                                                    <Input
                                                        id="generation"
                                                        name="generation"
                                                        defaultValue={
                                                            ruleset.generation
                                                        }
                                                        required
                                                    />
                                                    <FieldError
                                                        error={
                                                            errors.generation
                                                        }
                                                    />
                                                </Field>

                                                <Field
                                                    name="points_to_win"
                                                    data-invalid={
                                                        !!errors.points_to_win ||
                                                        undefined
                                                    }
                                                >
                                                    <FieldLabel htmlFor="points_to_win">
                                                        Poin Kemenangan Match
                                                    </FieldLabel>
                                                    <Input
                                                        id="points_to_win"
                                                        name="points_to_win"
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        defaultValue={
                                                            ruleset.points_to_win
                                                        }
                                                        required
                                                    />
                                                    <FieldError
                                                        error={
                                                            errors.points_to_win
                                                        }
                                                    />
                                                </Field>
                                            </div>

                                            {/* Finish Scoring Points */}
                                            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                                                <h3 className="text-sm font-semibold">
                                                    Skor Perolehan Finish Type
                                                </h3>

                                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                    <Field
                                                        name="spin_finish_points"
                                                        data-invalid={
                                                            !!errors.spin_finish_points ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="spin_finish_points">
                                                            Spin Finish
                                                        </FieldLabel>
                                                        <Input
                                                            id="spin_finish_points"
                                                            name="spin_finish_points"
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            defaultValue={
                                                                ruleset.spin_finish_points
                                                            }
                                                            required
                                                        />
                                                        <FieldError
                                                            error={
                                                                errors.spin_finish_points
                                                            }
                                                        />
                                                    </Field>

                                                    <Field
                                                        name="over_finish_points"
                                                        data-invalid={
                                                            !!errors.over_finish_points ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="over_finish_points">
                                                            Over Finish
                                                        </FieldLabel>
                                                        <Input
                                                            id="over_finish_points"
                                                            name="over_finish_points"
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            defaultValue={
                                                                ruleset.over_finish_points
                                                            }
                                                            required
                                                        />
                                                        <FieldError
                                                            error={
                                                                errors.over_finish_points
                                                            }
                                                        />
                                                    </Field>

                                                    <Field
                                                        name="burst_finish_points"
                                                        data-invalid={
                                                            !!errors.burst_finish_points ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="burst_finish_points">
                                                            Burst Finish
                                                        </FieldLabel>
                                                        <Input
                                                            id="burst_finish_points"
                                                            name="burst_finish_points"
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            defaultValue={
                                                                ruleset.burst_finish_points
                                                            }
                                                            required
                                                        />
                                                        <FieldError
                                                            error={
                                                                errors.burst_finish_points
                                                            }
                                                        />
                                                    </Field>

                                                    <Field
                                                        name="xtreme_finish_points"
                                                        data-invalid={
                                                            !!errors.xtreme_finish_points ||
                                                            undefined
                                                        }
                                                    >
                                                        <FieldLabel htmlFor="xtreme_finish_points">
                                                            Xtreme Finish
                                                        </FieldLabel>
                                                        <Input
                                                            id="xtreme_finish_points"
                                                            name="xtreme_finish_points"
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            defaultValue={
                                                                ruleset.xtreme_finish_points
                                                            }
                                                            required
                                                        />
                                                        <FieldError
                                                            error={
                                                                errors.xtreme_finish_points
                                                            }
                                                        />
                                                    </Field>
                                                </div>

                                                <Field
                                                    name="penalty_points"
                                                    data-invalid={
                                                        !!errors.penalty_points ||
                                                        undefined
                                                    }
                                                >
                                                    <FieldLabel htmlFor="penalty_points">
                                                        Poin Penalti /
                                                        Pelanggaran (Foul)
                                                    </FieldLabel>
                                                    <Input
                                                        id="penalty_points"
                                                        name="penalty_points"
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        defaultValue={
                                                            ruleset.penalty_points
                                                        }
                                                        required
                                                    />
                                                    <FieldError
                                                        error={
                                                            errors.penalty_points
                                                        }
                                                    />
                                                </Field>
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
                                    render={<Link href={rulesetsIndex().url} />}
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
