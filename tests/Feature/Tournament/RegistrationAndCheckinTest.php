<?php

use App\Actions\Tournament\OverrideLockedDeckAction;
use App\Actions\Tournament\PerformCheckinAction;
use App\Actions\Tournament\ProcessRegistrationQuotaAction;
use App\Actions\Tournament\RegisterBladerAction;
use App\Enums\DeckLockPolicyEnum;
use App\Enums\EventStatusEnum;
use App\Enums\RegistrationStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('public registration succeeds with valid deck data', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::REGISTRATION_OPEN]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'max_participants' => 16,
    ]);

    $payload = [
        'category_id' => $category->id,
        'name' => 'Kurogane Blader',
        'email' => 'kurogane@example.com',
        'display_nickname' => 'KuroX',
        'age' => 17,
        'deck_data' => [
            ['blade' => 'Dran Sword', 'ratchet' => '3-60', 'bit' => 'Flat (F)'],
            ['blade' => 'Hells Scythe', 'ratchet' => '4-60', 'bit' => 'Ball (B)'],
            ['blade' => 'Wizard Rod', 'ratchet' => '5-70', 'bit' => 'Hexa (H)'],
        ],
        'agree_rules' => true,
        'agree_media_release' => true,
    ];

    $response = $this->post(route('public.events.register.store', $event->id), $payload);
    $response->assertSessionHasNoErrors();

    $registration = Registration::where('category_id', $category->id)->first();
    expect($registration)->not->toBeNull();
    expect($registration->display_nickname)->toBe('KuroX');
    expect($registration->status)->toBe(RegistrationStatusEnum::CONFIRMED);
    expect($registration->seed_number)->toBe(1);
    expect($registration->deck_data)->toHaveCount(3);

    $response->assertRedirect(route('public.events.registration-success', $registration->id));
});

test('junior participant under 13 requires guardian details', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::REGISTRATION_OPEN]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'max_participants' => 16,
    ]);

    $action = app(RegisterBladerAction::class);

    // 1. Fails without guardian details
    expect(fn () => $action->execute($category, [
        'name' => 'Adik Kecil',
        'email' => 'adik@example.com',
        'display_nickname' => 'AdikX',
        'age' => 9,
    ]))->toThrow(ValidationException::class);

    // 2. Succeeds with guardian details
    $reg = $action->execute($category, [
        'name' => 'Adik Kecil',
        'email' => 'adik@example.com',
        'display_nickname' => 'AdikX',
        'age' => 9,
        'guardian_name' => 'Bapak Budi',
        'guardian_phone' => '081299990000',
        'guardian_relationship' => 'Ayah',
    ]);

    expect($reg)->not->toBeNull();
    expect($reg->guardian_details)->toBeArray();
    expect($reg->guardian_details['guardian_name'])->toBe('Bapak Budi');
});

test('registration is automatically placed on waitlist when quota is full', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::REGISTRATION_OPEN]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'max_participants' => 2, // Max 2 confirmed
    ]);

    $action = app(RegisterBladerAction::class);

    $reg1 = $action->execute($category, ['name' => 'Blader 1', 'email' => 'b1@example.com', 'display_nickname' => 'B1', 'age' => 15]);
    $reg2 = $action->execute($category, ['name' => 'Blader 2', 'email' => 'b2@example.com', 'display_nickname' => 'B2', 'age' => 15]);
    $reg3 = $action->execute($category, ['name' => 'Blader 3', 'email' => 'b3@example.com', 'display_nickname' => 'B3', 'age' => 15]);

    expect($reg1->status)->toBe(RegistrationStatusEnum::CONFIRMED);
    expect($reg1->seed_number)->toBe(1);

    expect($reg2->status)->toBe(RegistrationStatusEnum::CONFIRMED);
    expect($reg2->seed_number)->toBe(2);

    expect($reg3->status)->toBe(RegistrationStatusEnum::WAITLISTED);
    expect($reg3->seed_number)->toBeNull();
});

test('waitlisted blader is automatically promoted when confirmed blader is marked no-show', function () {
    $event = Event::factory()->create(['status' => EventStatusEnum::REGISTRATION_OPEN]);
    $category = TournamentCategory::factory()->create([
        'event_id' => $event->id,
        'max_participants' => 1,
    ]);

    $regAction = app(RegisterBladerAction::class);
    $checkinAction = app(PerformCheckinAction::class);
    $quotaAction = app(ProcessRegistrationQuotaAction::class);

    $p1 = $regAction->execute($category, ['name' => 'Blader Utama', 'email' => 'p1@example.com', 'display_nickname' => 'P1', 'age' => 15]);
    $p2 = $regAction->execute($category, ['name' => 'Blader Cadangan', 'email' => 'p2@example.com', 'display_nickname' => 'P2', 'age' => 15]);

    expect($p1->status)->toBe(RegistrationStatusEnum::CONFIRMED);
    expect($p2->status)->toBe(RegistrationStatusEnum::WAITLISTED);

    // Mark P1 as No-Show
    $checkinAction->markNoShow($p1, $quotaAction);

    $p1->refresh();
    $p2->refresh();

    expect($p1->status)->toBe(RegistrationStatusEnum::NO_SHOW);
    expect($p2->status)->toBe(RegistrationStatusEnum::CONFIRMED);
    expect($p2->seed_number)->toBe(1);
});

test('fast checkin marks blader as checked-in and locks deck according to policy', function () {
    $category = TournamentCategory::factory()->create([
        'deck_lock_policy' => DeckLockPolicyEnum::UNTIL_CHECKIN,
    ]);

    $reg = Registration::factory()->create([
        'category_id' => $category->id,
        'event_id' => $category->event_id,
        'status' => RegistrationStatusEnum::CONFIRMED,
        'is_deck_locked' => false,
    ]);

    $checkinAction = app(PerformCheckinAction::class);
    $checkinAction->execute($reg);

    $reg->refresh();
    expect($reg->status)->toBe(RegistrationStatusEnum::CHECKED_IN);
    expect($reg->is_deck_locked)->toBeTrue();
});

test('admin can override locked deck parts with written reason', function () {
    $organizer = User::factory()->create();
    $organizer->assignRole(UserRoleEnum::ORGANIZER->value);

    $reg = Registration::factory()->create([
        'status' => RegistrationStatusEnum::CHECKED_IN,
        'is_deck_locked' => true,
        'deck_data' => [
            ['blade' => 'Dran Sword', 'ratchet' => '3-60', 'bit' => 'Flat'],
        ],
    ]);

    $newDeck = [
        ['blade' => 'Dran Buster', 'ratchet' => '1-60', 'bit' => 'Rush'],
    ];

    $overrideAction = app(OverrideLockedDeckAction::class);
    $overrideAction->execute($reg, $newDeck, 'Bit Flat pecah saat uji coba arena', $organizer);

    $reg->refresh();
    expect($reg->deck_data[0]['blade'])->toBe('Dran Buster');
    expect(str_contains($reg->notes ?? '', 'Bit Flat pecah saat uji coba arena'))->toBeTrue();
    expect(str_contains($reg->notes ?? '', $organizer->email))->toBeTrue();
});
