<?php

namespace App\Events\Tournament;

use App\Models\TournamentCategory;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BracketUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TournamentCategory $category
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("category.{$this->category->id}.bracket"),
            new Channel("tournament.{$this->category->event_id}.bracket"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'category_id' => $this->category->id,
            'category_name' => $this->category->name,
            'event_id' => $this->category->event_id,
            'updated_at' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'bracket.updated';
    }
}
