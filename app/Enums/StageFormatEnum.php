<?php

namespace App\Enums;

enum StageFormatEnum: string
{
    case ROUND_ROBIN_GROUP = 'round_robin_group';
    case SINGLE_ELIMINATION_BRACKET = 'single_elimination_bracket';
    case DOUBLE_ELIMINATION_BRACKET = 'double_elimination_bracket';
    case SWISS_ROUNDS = 'swiss_rounds';
    case FREE_FOR_ALL = 'free_for_all';

    public function label(): string
    {
        return match ($this) {
            self::ROUND_ROBIN_GROUP => 'Grup Round Robin',
            self::SINGLE_ELIMINATION_BRACKET => 'Bagan Gugur Tunggal',
            self::DOUBLE_ELIMINATION_BRACKET => 'Bagan Gugur Ganda',
            self::SWISS_ROUNDS => 'Babak Swiss',
            self::FREE_FOR_ALL => 'Battle Royale (Bebas)',
        };
    }
}
