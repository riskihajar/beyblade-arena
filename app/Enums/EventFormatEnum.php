<?php

namespace App\Enums;

enum EventFormatEnum: string
{
    case SINGLE_ELIMINATION = 'single_elimination';
    case DOUBLE_ELIMINATION = 'double_elimination';
    case ROUND_ROBIN = 'round_robin';
    case SWISS = 'swiss';
    case CUSTOM_GROUP_PLAYOFF = 'custom_group_playoff';

    public function label(): string
    {
        return match ($this) {
            self::SINGLE_ELIMINATION => 'Single Elimination (Gugur Tunggal)',
            self::DOUBLE_ELIMINATION => 'Double Elimination (Gugur Ganda)',
            self::ROUND_ROBIN => 'Round Robin (Setengah Kompetisi)',
            self::SWISS => 'Swiss System',
            self::CUSTOM_GROUP_PLAYOFF => 'Grup + Babak Gugur (Playoff)',
        };
    }
}
