<?php

namespace App\Http\Requests\Admin\Registration;

use Illuminate\Foundation\Http\FormRequest;

class OverrideDeckRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('registration'));
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:500'],
            'deck_data' => ['required', 'array', 'min:1', 'max:3'],
            'deck_data.*.blade' => ['required', 'string', 'max:100'],
            'deck_data.*.ratchet' => ['required', 'string', 'max:100'],
            'deck_data.*.bit' => ['required', 'string', 'max:100'],
        ];
    }
}
