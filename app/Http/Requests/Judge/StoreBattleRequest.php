<?php

namespace App\Http\Requests\Judge;

use App\Enums\MatchFinishTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBattleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('match'));
    }

    public function rules(): array
    {
        return [
            'winner_id' => ['nullable', 'exists:registrations,id'],
            'finish_type' => ['nullable', Rule::enum(MatchFinishTypeEnum::class)],
            'is_draw' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:255'],
            'client_request_id' => ['nullable', 'string', 'max:100'],
        ];
    }
}
