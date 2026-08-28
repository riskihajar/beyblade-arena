<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public registration endpoint
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:tournament_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'display_nickname' => ['required', 'string', 'max:100'],
            'age' => ['required', 'integer', 'min:3', 'max:99'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'guardian_relationship' => ['nullable', 'string', 'max:100'],
            'deck_data' => ['nullable', 'array', 'min:1', 'max:3'],
            'deck_data.*.blade' => ['required_with:deck_data', 'string', 'max:100'],
            'deck_data.*.ratchet' => ['required_with:deck_data', 'string', 'max:100'],
            'deck_data.*.bit' => ['required_with:deck_data', 'string', 'max:100'],
            'agree_rules' => ['accepted'],
            'agree_media_release' => ['accepted'],
        ];
    }
}
