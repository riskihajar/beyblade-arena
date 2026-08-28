<?php

namespace App\Exports;

use App\Models\SeasonRanking;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SeasonLeaderboardExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected string $seasonId
    ) {}

    public function collection()
    {
        return SeasonRanking::where('season_id', $this->seasonId)
            ->with(['user', 'season'])
            ->orderBy('rank_position')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Peringkat (Rank)',
            'Nama Blader',
            'Total Poin',
            'Turnamen Diikuti',
            'Turnamen Dimenangkan',
            'Match Menang',
            'Match Kalah',
            'Win Rate (%)',
        ];
    }

    /**
     * @param  SeasonRanking  $row
     */
    public function map($row): array
    {
        $totalMatches = $row->matches_won + $row->matches_lost;
        $winRate = $totalMatches > 0 ? round(($row->matches_won / $totalMatches) * 100, 1) : 0;

        return [
            $row->rank_position,
            $row->user?->name ?? 'Blader',
            $row->total_points,
            $row->tournaments_played,
            $row->tournaments_won,
            $row->matches_won,
            $row->matches_lost,
            "{$winRate}%",
        ];
    }
}
