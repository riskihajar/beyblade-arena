<?php

namespace App\Enums;

enum DeckLockPolicyEnum: string
{
    case UNTIL_CHECKIN = 'until_checkin';
    case UNTIL_TOP_CUT = 'until_top_cut';
    case FREE_BETWEEN_MATCHES = 'free_between_matches';

    public function label(): string
    {
        return match ($this) {
            self::UNTIL_CHECKIN => 'Terkunci sejak Check-in (Strict / Kompetitif)',
            self::UNTIL_TOP_CUT => 'Terkunci saat Masuk Babak Gugur (Top Cut)',
            self::FREE_BETWEEN_MATCHES => 'Bebas Ganti Antar-Match (Casual Gathering)',
        };
    }
}
