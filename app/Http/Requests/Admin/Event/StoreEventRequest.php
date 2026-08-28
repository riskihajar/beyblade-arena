<?php

namespace App\Http\Requests\Admin\Event;

use App\Enums\EventStatusEnum;
use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Event::class);
    }

    public function rules(): array
    {
        return [
            'season_id' => ['nullable', 'exists:seasons,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:events,slug'],
            'description' => ['nullable', 'string'],
            'venue_name' => ['required', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string'],
            'venue_city' => ['required', 'string', 'max:100'],
            'venue_maps_url' => ['nullable', 'url', 'max:500'],
            'registration_start_at' => ['required', 'date'],
            'registration_end_at' => ['required', 'date', 'after:registration_start_at'],
            'event_start_at' => ['required', 'date', 'after_or_equal:registration_end_at'],
            'event_end_at' => ['nullable', 'date', 'after:event_start_at'],
            'status' => ['required', Rule::enum(EventStatusEnum::class)],
            'entry_fee' => ['required', 'numeric', 'min:0'],
            'tier_multiplier' => ['required', 'numeric', 'min:0.1', 'max:5.0'],
            'is_ranking_eligible' => ['boolean'],
            'rules_and_regulations' => ['nullable', 'string'],
        ];
    }
}
