<?php

namespace App\Events\Tournament;

use App\Models\MatchBattle;
use App\Models\TournamentMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleRecordedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TournamentMatch $match,
        public MatchBattle $battle
    ) {}

    public function broadcastOn(): array
    {
        $eventId = $this->match->category?->event_id;

        return [
            new Channel("match.{$this->match->id}.score"),
            new Channel("tournament.{$eventId}.scores"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->match->id,
            'category_id' => $this->match->category_id,
            'battle_number' => $this->battle->battle_number,
            'winner_id' => $this->battle->winner_id,
            'finish_type' => $this->battle->finish_type->value,
            'points_awarded' => $this->battle->points_awarded,
            'player1_score' => $this->match->player1_score,
            'player2_score' => $this->match->player2_score,
            'is_draw' => $this->battle->is_draw,
            'is_completed' => ($this->match->status->value === 'completed'),
            'winner_name' => $this->match->winner?->display_nickname ?? $this->match->winner?->user?->name,
        ];
    }

    public function broadcastAs(): string
    {
        return 'battle.recorded';
    }
}
