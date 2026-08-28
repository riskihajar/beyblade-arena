<?php

namespace App\Exports;

use App\Models\Registration;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RegistrationsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        protected string $eventId
    ) {}

    public function collection()
    {
        return Registration::where('event_id', $this->eventId)
            ->with(['user', 'category'])
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID Registrasi',
            'Kategori',
            'Nama Akun',
            'Display Nickname',
            'Status',
            'Seed Number',
            'Group Code',
            'Deck Combo 1',
            'Deck Combo 2',
            'Deck Combo 3',
            'Wali / Orang Tua',
            'Kontak Wali',
            'Tanggal Daftar',
        ];
    }

    /**
     * @param  Registration  $row
     */
    public function map($row): array
    {
        $deck = $row->deck_data ?? [];
        $combo1 = isset($deck[0]) ? "{$deck[0]['blade']} {$deck[0]['ratchet']}-{$deck[0]['bit']}" : '-';
        $combo2 = isset($deck[1]) ? "{$deck[1]['blade']} {$deck[1]['ratchet']}-{$deck[1]['bit']}" : '-';
        $combo3 = isset($deck[2]) ? "{$deck[2]['blade']} {$deck[2]['ratchet']}-{$deck[2]['bit']}" : '-';

        $guardian = $row->guardian_details;
        $guardianName = $guardian['guardian_name'] ?? '-';
        $guardianPhone = $guardian['guardian_phone'] ?? '-';

        return [
            $row->id,
            $row->category?->name ?? '-',
            $row->user?->name ?? '-',
            $row->display_nickname,
            $row->status->value,
            $row->seed_number ?? '-',
            $row->group_code ?? '-',
            $combo1,
            $combo2,
            $combo3,
            $guardianName,
            $guardianPhone,
            $row->created_at->format('Y-m-d H:i'),
        ];
    }
}
