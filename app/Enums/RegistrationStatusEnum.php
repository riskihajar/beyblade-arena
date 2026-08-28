<?php

namespace App\Enums;

enum RegistrationStatusEnum: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case CHECKED_IN = 'checked_in';
    case DISQUALIFIED = 'disqualified';
    case WITHDRAWN = 'withdrawn';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Verifikasi',
            self::CONFIRMED => 'Terkonfirmasi (Terdaftar)',
            self::CHECKED_IN => 'Hadir di Venue (Checked In)',
            self::DISQUALIFIED => 'Didiskualifikasi (DQ)',
            self::WITHDRAWN => 'Mengundurkan Diri',
        };
    }

    public function isEligibleForBracket(): bool
    {
        return in_array($this, [self::CONFIRMED, self::CHECKED_IN], true);
    }
}
