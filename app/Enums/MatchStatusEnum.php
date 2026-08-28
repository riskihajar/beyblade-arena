<?php

namespace App\Enums;

enum MatchStatusEnum: string
{
    case SCHEDULED = 'scheduled';
    case QUEUED = 'queued';
    case CALLED = 'called';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case DISPUTED = 'disputed';
    case WALKOVER = 'walkover';

    public function label(): string
    {
        return match ($this) {
            self::SCHEDULED => 'Terjadwal',
            self::QUEUED => 'Dalam Antrean',
            self::CALLED => 'Dipanggil ke Stadium',
            self::IN_PROGRESS => 'Sedang Bertarung (Live)',
            self::COMPLETED => 'Selesai',
            self::DISPUTED => 'Sengketa (Dispute)',
            self::WALKOVER => 'Menang WO (Walkover)',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::COMPLETED, self::WALKOVER], true);
    }
}
