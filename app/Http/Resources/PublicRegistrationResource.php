<?php

namespace App\Http\Resources;

use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Registration
 */
class PublicRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'category_id' => $this->category_id,
            'display_nickname' => $this->display_nickname,
            'seed_number' => $this->seed_number,
            'group_code' => $this->group_code,
            'status' => $this->status->value,
            'is_deck_locked' => $this->is_deck_locked,
            'deck_data' => $this->deck_data,
            // Strictly excluded: guardian_details, user.email, user.phone, real names of juniors
        ];
    }
}
