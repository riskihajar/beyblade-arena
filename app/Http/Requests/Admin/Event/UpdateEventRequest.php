<?php

namespace App\Http\Requests\Admin\Event;

use App\Enums\EventStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('event'));
    }

    public function rules(): array
    {
        $eventId = $this->route('event')?->id;

        return [
            'season_id' => ['nullable', 'exists:seasons,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('events', 'slug')->ignore($eventId)],
            'description' => ['nullable', 'string'],
            'venue_name' => ['required', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string'],
            'venue_city' => ['required', 'string', 'max:100'],
            'venue_maps_url' => ['nullable', 'url', 'max:500'],
            'registration_start_at' => ['required', 'date'],
            'registration_end_at' => ['required', 'date'],
            'event_start_at' => ['required', 'date'],
            'event_end_at' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(EventStatusEnum::class)],
            'entry_fee' => ['required', 'numeric', 'min:0'],
            'tier_multiplier' => ['required', 'numeric', 'min:0.1', 'max:5.0'],
            'is_ranking_eligible' => ['boolean'],
            'rules_and_regulations' => ['nullable', 'string'],
        ];
    }
}
