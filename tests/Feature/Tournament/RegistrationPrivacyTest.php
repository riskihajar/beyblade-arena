<?php

use App\Models\Registration;
use App\Models\User;

test('registration model strictly hides guardian details from serialization', function () {
    $user = User::factory()->create(['name' => 'Budi Junior']);

    $registration = Registration::factory()->create([
        'user_id' => $user->id,
        'display_nickname' => 'BudiBladerX',
        'guardian_details' => [
            'guardian_name' => 'Bapak Subagio',
            'guardian_phone' => '081299998888',
            'relationship' => 'Ayah Kandung',
        ],
    ]);

    // 1. In PHP direct attribute access, it is decrypted and accessible for backend logic
    expect($registration->guardian_details)->toBeArray();
    expect($registration->guardian_details['guardian_name'])->toBe('Bapak Subagio');

    // 2. In array serialization (Inertia/API props), it MUST be hidden
    $array = $registration->toArray();
    expect($array)->not->toHaveKey('guardian_details');
    expect($array)->toHaveKey('display_nickname');
    expect($array['display_nickname'])->toBe('BudiBladerX');

    // 3. In JSON serialization, it MUST NOT contain PII
    $json = json_encode($registration);
    expect($json)->not->toContain('Bapak Subagio');
    expect($json)->not->toContain('081299998888');
    expect($json)->toContain('BudiBladerX');
});
