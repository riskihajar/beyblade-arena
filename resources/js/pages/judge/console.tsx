import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import AppLayout from '@/layouts/app-layout';
import { JudgeScorePad } from '@/components/tournament/judge-score-pad';
import { type BreadcrumbItem } from '@/types';
import { type TournamentMatch } from '@/types/tournament';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Flame,
    Play,
    Shield,
    Swords,
    Trophy,
    User,
} from 'lucide-react';

interface Props {
    activeMatches: TournamentMatch[];
    recentMatches: TournamentMatch[];
    selectedMatch?: TournamentMatch | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Konsol Juri & Wasit', href: '#' },
];

export default function JudgeConsole({
    activeMatches,
    recentMatches,
    selectedMatch,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    selectedMatch
                        ? `Skor Match #${selectedMatch.match_order}`
                        : 'Konsol Juri & Wasit Arena'
                }
            />

            <div className="container mx-auto space-y-6 px-4 py-6">
                {selectedMatch ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon-sm"
                                render={<Link href="/judge/console" />}
                                title="Kembali ke Antrean"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Kembali ke Antrean Match Juri
                            </span>
                        </div>

                        <JudgeScorePad match={selectedMatch} />
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Shield className="size-6 text-primary" />
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Konsol Wasit & Juri Lapangan
                                </h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Pilih pertandingan yang dipanggil ke arena Anda
                                untuk memulai pencatatan poin ronde battle.
                            </p>
                        </div>

                        {/* Active / Called Matches */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                    <Flame className="size-4 text-primary" />
                                    Pertandingan Aktif di Arena
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {activeMatches.length} Siap Tanding
                                </Badge>
                            </div>

                            {activeMatches.length === 0 ? (
                                <Empty className="rounded-xl border bg-card py-8">
                                    <EmptyHeader>
                                        <Clock className="size-8 text-muted-foreground" />
                                        <EmptyTitle>
                                            Belum ada pertandingan yang
                                            dipanggil
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Menunggu panitia meja pertandingan
                                            memanggil match berikutnya ke
                                            stadium arena Anda.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {activeMatches.map((match) => (
                                        <Card
                                            key={match.id}
                                            className="border-primary/30 shadow-xs transition-all hover:border-primary"
                                        >
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs font-semibold"
                                                    >
                                                        {match.stadium?.name ||
                                                            'Stadium Arena'}
                                                    </Badge>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px]"
                                                    >
                                                        {match.status}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="mt-1 text-base font-bold">
                                                    {match.player1
                                                        ?.display_nickname ||
                                                        match.player1?.user
                                                            ?.name ||
                                                        'Blader 1'}{' '}
                                                    vs{' '}
                                                    {match.player2
                                                        ?.display_nickname ||
                                                        match.player2?.user
                                                            ?.name ||
                                                        'Blader 2'}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {
                                                        match.category?.event
                                                            ?.name
                                                    }{' '}
                                                    • {match.category?.name}{' '}
                                                    (Match #{match.match_order})
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex items-center justify-between p-4 pt-2">
                                                <span className="font-mono text-sm font-bold text-foreground">
                                                    Skor: {match.player1_score}{' '}
                                                    - {match.player2_score}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 font-semibold"
                                                    render={
                                                        <Link
                                                            href={`/judge/matches/${match.id}`}
                                                        />
                                                    }
                                                >
                                                    <Play className="size-3.5 fill-current" />
                                                    <span>
                                                        Buka Papan Wasit
                                                    </span>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recently Completed Matches */}
                        {recentMatches.length > 0 && (
                            <div className="space-y-3 pt-4">
                                <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Pertandingan Terakhir yang Anda Pimpin
                                </h3>
                                <div className="space-y-2">
                                    {recentMatches.map((match) => (
                                        <div
                                            key={match.id}
                                            className="flex items-center justify-between rounded-lg border bg-card p-3 text-xs"
                                        >
                                            <div>
                                                <span className="font-semibold text-foreground">
                                                    {match.player1
                                                        ?.display_nickname ||
                                                        match.player1?.user
                                                            ?.name}{' '}
                                                    vs{' '}
                                                    {match.player2
                                                        ?.display_nickname ||
                                                        match.player2?.user
                                                            ?.name}
                                                </span>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Pemenang:{' '}
                                                    {match.winner
                                                        ?.display_nickname ||
                                                        match.winner?.user
                                                            ?.name}{' '}
                                                    ({match.player1_score} -{' '}
                                                    {match.player2_score})
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                {match.stadium?.name}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
