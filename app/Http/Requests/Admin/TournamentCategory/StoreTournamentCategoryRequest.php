<?php

namespace App\Http\Requests\Admin\TournamentCategory;

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use App\Models\TournamentCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTournamentCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', TournamentCategory::class);
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'exists:events,id'],
            'ruleset_id' => ['required', 'exists:tournament_rulesets,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'min_age' => ['nullable', 'integer', 'min:3', 'max:99'],
            'max_age' => ['nullable', 'integer', 'min:3', 'max:99', 'gte:min_age'],
            'max_participants' => ['required', 'integer', 'min:2', 'max:512'],
            'format' => ['required', Rule::enum(EventFormatEnum::class)],
            'stage_config' => ['nullable', 'array'],
            'deck_lock_policy' => ['required', Rule::enum(DeckLockPolicyEnum::class)],
            'tie_breaker_priority' => ['nullable', 'array'],
            'call_timeout_seconds' => ['required', 'integer', 'min:30', 'max:600'],
            'target_points' => ['required', 'integer', 'min:1', 'max:20'],
        ];
    }
}
