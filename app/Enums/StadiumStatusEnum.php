<?php

namespace App\Enums;

enum StadiumStatusEnum: string
{
    case AVAILABLE = 'available';
    case IN_USE = 'in_use';
    case MAINTENANCE = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE => 'Siap Digunakan (Available)',
            self::IN_USE => 'Sedang Tanding (In Use)',
            self::MAINTENANCE => 'Perawatan / Rusak (Maintenance)',
        };
    }

    public function isAvailable(): bool
    {
        return $this === self::AVAILABLE;
    }
}
