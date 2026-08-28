<?php

namespace App\Events\Tournament;

use App\Models\Event;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventStatusChangedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Event $event
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("tournament.{$this->event->id}.status"),
            new Channel('tournaments.public'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'event_id' => $this->event->id,
            'event_name' => $this->event->name,
            'status' => $this->event->status->value,
            'updated_at' => now()->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'event.status_changed';
    }
}
