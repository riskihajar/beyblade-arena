<?php

namespace App\Models;

use App\Concerns\HasUlids;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\Models\Activity as Model;

class Activity extends Model
{
    use HasUlids, Searchable;

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'event' => $this->event,
            'log_name' => $this->log_name,
            'created_at' => $this->created_at?->timestamp,
        ];
    }
}
