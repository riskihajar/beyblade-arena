<?php

namespace App\Http\Requests\Admin\TournamentRuleset;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTournamentRulesetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('ruleset'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'generation' => ['required', 'string', 'max:50'],
            'points_to_win' => ['required', 'integer', 'min:1', 'max:20'],
            'spin_finish_points' => ['required', 'integer', 'min:0', 'max:10'],
            'over_finish_points' => ['required', 'integer', 'min:0', 'max:10'],
            'burst_finish_points' => ['required', 'integer', 'min:0', 'max:10'],
            'xtreme_finish_points' => ['required', 'integer', 'min:0', 'max:10'],
            'penalty_points' => ['required', 'integer', 'min:0', 'max:10'],
            'custom_rules_config' => ['nullable', 'array'],
            'is_official' => ['boolean'],
        ];
    }
}
