<?php

namespace App\Events\Tournament;

use App\Models\TournamentMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchCalledEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TournamentMatch $match
    ) {}

    public function broadcastOn(): array
    {
        $eventId = $this->match->category?->event_id;

        return [
            new Channel("tournament.{$eventId}.calls"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->match->id,
            'category_id' => $this->match->category_id,
            'stadium_id' => $this->match->stadium_id,
            'stadium_name' => $this->match->stadium?->name,
            'player1_name' => $this->match->player1?->display_nickname ?? $this->match->player1?->user?->name,
            'player2_name' => $this->match->player2?->display_nickname ?? $this->match->player2?->user?->name,
            'match_order' => $this->match->match_order,
            'round_number' => $this->match->round_number,
            'called_at' => $this->match->called_at?->toISOString(),
            'status' => $this->match->status->value,
        ];
    }

    public function broadcastAs(): string
    {
        return 'match.called';
    }
}
