import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Frame } from '@/components/ui/frame';
import { Pagination } from '@/components/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { create, edit, index as rulesetsIndex } from '@/routes/admin/rulesets';
import { type BreadcrumbItem } from '@/types';
import { type TournamentRuleset } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Plus, ShieldCheck } from 'lucide-react';

interface PaginatedRulesets {
    data: TournamentRuleset[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    rulesets: PaginatedRulesets;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ruleset Scoring', href: rulesetsIndex().url },
];

export default function AdminRulesetsIndex({ rulesets }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Ruleset & Scoring" />

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Ruleset & Scoring Engine
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola template aturan penilaian finish (Spin,
                                Over, Burst, Xtreme) untuk Beyblade X dan
                                turnamen komunitas.
                            </p>
                        </div>

                        <Button render={<Link href={create().url} />}>
                            <Plus className="size-4" />
                            <span>Buat Ruleset Baru</span>
                        </Button>
                    </div>

                    {/* Table inside Frame */}
                    <Frame className="w-full">
                        {rulesets.data.length === 0 ? (
                            <Empty className="py-12">
                                <EmptyHeader>
                                    <BookOpen className="size-10 text-muted-foreground" />
                                    <EmptyTitle>Belum ada ruleset</EmptyTitle>
                                    <EmptyDescription>
                                        Buat template ruleset untuk menentukan
                                        poin finish battle.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            Nama Ruleset & Generasi
                                        </TableHead>
                                        <TableHead>Target Win</TableHead>
                                        <TableHead>Spin / Over</TableHead>
                                        <TableHead>Burst / Xtreme</TableHead>
                                        <TableHead>Penalti</TableHead>
                                        <TableHead>Kategori Dipakai</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rulesets.data.map((ruleset) => (
                                        <TableRow key={ruleset.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">
                                                        {ruleset.name}
                                                    </span>
                                                    {ruleset.is_official && (
                                                        <Badge
                                                            variant="default"
                                                            className="gap-1 text-[10px]"
                                                        >
                                                            <ShieldCheck className="size-3" />
                                                            Official
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Generasi:{' '}
                                                    {ruleset.generation}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {ruleset.points_to_win} Poin
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                Spin:{' '}
                                                <span className="font-semibold">
                                                    {ruleset.spin_finish_points}
                                                </span>{' '}
                                                | Over:{' '}
                                                <span className="font-semibold">
                                                    {ruleset.over_finish_points}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                Burst:{' '}
                                                <span className="font-semibold">
                                                    {
                                                        ruleset.burst_finish_points
                                                    }
                                                </span>{' '}
                                                | Xtreme:{' '}
                                                <span className="font-semibold text-primary">
                                                    {
                                                        ruleset.xtreme_finish_points
                                                    }
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <span className="font-medium text-destructive">
                                                    {ruleset.penalty_points}{' '}
                                                    Poin
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {ruleset.categories_count ?? 0}{' '}
                                                Kategori
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={
                                                        <Link
                                                            href={
                                                                edit({
                                                                    ruleset:
                                                                        ruleset.id,
                                                                }).url
                                                            }
                                                        />
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Frame>

                    {/* Pagination */}
                    <Pagination data={rulesets} />
                </div>
            </div>
        </AppLayout>
    );
}
