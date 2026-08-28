<?php

namespace App\Actions\Tournament;

use App\Enums\RegistrationStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Event;
use App\Models\Registration;
use App\Models\TournamentCategory;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegisterBladerAction
{
    /**
     * Register a blader to a tournament category.
     *
     * @throws ValidationException
     */
    public function execute(TournamentCategory $category, array $data, ?User $currentUser = null): Registration
    {
        $event = $category->event;

        // 1. Verify Event is open for registration
        if (! $event->status->isRegistrationActive()) {
            throw ValidationException::withMessages([
                'category_id' => 'Pendaftaran untuk event turnamen ini sedang ditutup atau belum dibuka.',
            ]);
        }

        // 2. Resolve User (Logged-in user or Guest user by email)
        $user = $currentUser;
        if (! $user) {
            $email = $data['email'] ?? null;
            if (! $email) {
                throw ValidationException::withMessages([
                    'email' => 'Email wajib diisi untuk pendaftaran.',
                ]);
            }

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $data['name'],
                    'password' => Hash::make(Str::random(16)),
                    'email_verified_at' => now(),
                ]
            );
        }

        // Assign blader role if user has no role
        if ($user->roles->isEmpty()) {
            $user->assignRole(UserRoleEnum::BLADER->value);
        }

        // 3. Verify user is not already registered for this category
        $alreadyRegistered = Registration::where('category_id', $category->id)
            ->where('user_id', $user->id)
            ->whereIn('status', [
                RegistrationStatusEnum::PENDING->value,
                RegistrationStatusEnum::CONFIRMED->value,
                RegistrationStatusEnum::CHECKED_IN->value,
                RegistrationStatusEnum::WAITLISTED->value,
            ])
            ->exists();

        if ($alreadyRegistered) {
            throw ValidationException::withMessages([
                'category_id' => 'Anda sudah terdaftar dalam kategori divisi ini.',
            ]);
        }

        // 4. Validate Age Restriction if category has age limits
        $age = $data['age'] ?? null;
        if ($category->min_age && $age !== null && $age < $category->min_age) {
            throw ValidationException::withMessages([
                'age' => "Usia minimal untuk kategori ini adalah {$category->min_age} tahun.",
            ]);
        }
        if ($category->max_age && $age !== null && $age > $category->max_age) {
            throw ValidationException::withMessages([
                'age' => "Usia maksimal untuk kategori ini adalah {$category->max_age} tahun.",
            ]);
        }

        // 5. Enforce Guardian Details for Junior Bladers (< 13 years or junior category)
        $isJunior = ($age !== null && $age < 13) || ($category->max_age !== null && $category->max_age <= 12);
        $guardianDetails = null;

        if ($isJunior) {
            if (empty($data['guardian_name']) || empty($data['guardian_phone'])) {
                throw ValidationException::withMessages([
                    'guardian_name' => 'Data nama dan nomor kontak orang tua/wali wajib diisi untuk peserta kategori anak/junior.',
                ]);
            }

            $guardianDetails = [
                'guardian_name' => $data['guardian_name'],
                'guardian_phone' => $data['guardian_phone'],
                'relationship' => $data['guardian_relationship'] ?? 'Orang Tua',
            ];
        }

        // 6. Quota check: Determine if Confirmed or Waitlisted
        $confirmedCount = Registration::where('category_id', $category->id)
            ->whereIn('status', [
                RegistrationStatusEnum::CONFIRMED->value,
                RegistrationStatusEnum::CHECKED_IN->value,
            ])
            ->count();

        $status = ($confirmedCount >= $category->max_participants)
            ? RegistrationStatusEnum::WAITLISTED
            : RegistrationStatusEnum::CONFIRMED;

        // 7. Seed Number for confirmed bladers
        $seedNumber = ($status === RegistrationStatusEnum::CONFIRMED) ? $confirmedCount + 1 : null;

        // 8. Create Registration record
        return Registration::create([
            'event_id' => $event->id,
            'category_id' => $category->id,
            'user_id' => $user->id,
            'display_nickname' => $data['display_nickname'] ?? $user->name,
            'seed_number' => $seedNumber,
            'status' => $status,
            'deck_data' => $data['deck_data'] ?? null,
            'is_deck_locked' => false,
            'guardian_details' => $guardianDetails,
            'notes' => $data['notes'] ?? null,
        ]);
    }
}
