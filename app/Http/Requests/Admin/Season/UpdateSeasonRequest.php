<?php

namespace App\Http\Requests\Admin\Season;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeasonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('season'));
    }

    public function rules(): array
    {
        $seasonId = $this->route('season')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('seasons', 'slug')->ignore($seasonId)],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'formula_config' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];
    }
}
