<?php

namespace App\Http\Requests\Admin\Season;

use App\Models\Season;
use Illuminate\Foundation\Http\FormRequest;

class StoreSeasonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Season::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:seasons,slug'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'formula_config' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];
    }
}
