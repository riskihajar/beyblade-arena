<?php

namespace App\Enums;

enum UserRoleEnum: string
{
    case ADMIN = 'admin';
    case ORGANIZER = 'organizer';
    case JUDGE = 'judge';
    case BLADER = 'blader';
    case PARENT_GUARDIAN = 'parent_guardian';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrator Utama',
            self::ORGANIZER => 'Panitia Penyelenggara',
            self::JUDGE => 'Juri Pertandingan',
            self::BLADER => 'Peserta (Blader)',
            self::PARENT_GUARDIAN => 'Orang Tua / Wali',
        };
    }
}
