<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SeasonPointsAudit extends Model
{
    use HasFactory, HasUlids, LogsActivity;

    protected $fillable = [
        'season_id',
        'event_id',
        'user_id',
        'points_awarded',
        'calculation_breakdown',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'points_awarded' => 'integer',
            'calculation_breakdown' => 'array',
        ];
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class, 'season_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['season_id', 'event_id', 'user_id', 'points_awarded', 'reason'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
