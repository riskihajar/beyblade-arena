<?php

namespace App\Enums;

enum EventStatusEnum: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case REGISTRATION_OPEN = 'registration_open';
    case REGISTRATION_CLOSED = 'registration_closed';
    case ONGOING = 'ongoing';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draf (Belum Publik)',
            self::PUBLISHED => 'Dipublikasikan',
            self::REGISTRATION_OPEN => 'Pendaftaran Dibuka',
            self::REGISTRATION_CLOSED => 'Pendaftaran Ditutup',
            self::ONGOING => 'Sedang Berlangsung',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function isRegistrationActive(): bool
    {
        return $this === self::REGISTRATION_OPEN;
    }

    public function isLive(): bool
    {
        return $this === self::ONGOING;
    }
}
