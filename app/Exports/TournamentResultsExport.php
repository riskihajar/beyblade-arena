<?php

namespace App\Exports;

use App\Models\TournamentMatch;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TournamentResultsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected string $eventId
    ) {}

    public function collection()
    {
        return TournamentMatch::whereHas('category', fn ($q) => $q->where('event_id', $this->eventId))
            ->with(['category', 'player1.user', 'player2.user', 'winner.user', 'stadium'])
            ->orderBy('round_number')
            ->orderBy('match_order')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Match ID',
            'Kategori',
            'Babak (Round)',
            'Match Order',
            'Bagan / Tipe',
            'Blader 1',
            'Blader 2',
            'Skor Blader 1',
            'Skor Blader 2',
            'Pemenang',
            'Arena Stadium',
            'Status',
        ];
    }

    /**
     * @param  TournamentMatch  $row
     */
    public function map($row): array
    {
        return [
            $row->id,
            $row->category?->name ?? '-',
            $row->round_number,
            $row->match_order,
            $row->bracket_type,
            $row->player1?->display_nickname ?? $row->player1?->user?->name ?? 'TBD',
            $row->player2?->display_nickname ?? $row->player2?->user?->name ?? 'TBD',
            $row->player1_score,
            $row->player2_score,
            $row->winner?->display_nickname ?? $row->winner?->user?->name ?? '-',
            $row->stadium?->name ?? '-',
            $row->status->value,
        ];
    }
}
