<?php

namespace App\Http\Requests\Admin\TournamentCategory;

use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventFormatEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTournamentCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('category'));
    }

    public function rules(): array
    {
        return [
            'ruleset_id' => ['required', 'exists:tournament_rulesets,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'min_age' => ['nullable', 'integer', 'min:3', 'max:99'],
            'max_age' => ['nullable', 'integer', 'min:3', 'max:99'],
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
