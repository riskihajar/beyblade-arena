<?php

namespace App\Enums;

enum LogType: string
{
    case All = 'all';
    case User = 'user';
    case Admin = 'admin';
    case Authentication = 'authentication';

    public function label(): string
    {
        return match ($this) {
            self::All => 'All Logs',
            self::User => 'User Activities',
            self::Admin => 'Admin Activities',
            self::Authentication => 'Authentication',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function toSelectOptions(): array
    {
        return array_map(
            fn (self $case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases()
        );
    }
}
