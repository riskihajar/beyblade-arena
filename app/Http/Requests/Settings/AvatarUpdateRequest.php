<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class AvatarUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                'mimes:jpeg,jpg,png,gif',
                File::image()
                    ->min(1)
                    ->max(2 * 1024)
                    ->dimensions(
                        Rule::dimensions()
                            ->minWidth(100)
                            ->minHeight(100)
                            ->maxWidth(1000)
                            ->maxHeight(1000)
                    ),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'Please select an image to upload.',
            'avatar.image' => 'The file must be an image.',
            'avatar.mimes' => 'The image must be a JPEG, PNG, or GIF file.',
            'avatar.max' => 'The image size must not exceed 2MB.',
            'avatar.dimensions' => 'The image must be between 100x100 and 1000x1000 pixels.',
        ];
    }
}
