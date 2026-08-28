<?php

namespace App\Http\Requests\Admin\Stadium;

use Illuminate\Foundation\Http\FormRequest;

class CallMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('match'));
    }

    public function rules(): array
    {
        return [
            'stadium_id' => ['required', 'exists:stadiums,id'],
            'judge_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
