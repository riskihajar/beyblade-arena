<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\search;

class UserAssignRoleCommand extends Command
{
    protected $description = 'Assign roles to an existing user';

    protected $signature = 'user:assign-role
                            {--user= : User ID to assign roles to}
                            {--role=* : Role(s) to assign}';

    public function handle(): int
    {
        $userId = $this->option('user');

        if (empty($userId)) {
            $user = search(
                label: 'Search user',
                options: fn (string $value) => User::query()
                    ->where('name', 'like', "%{$value}%")
                    ->orWhere('email', 'like', "%{$value}%")
                    ->limit(10)
                    ->get()
                    ->mapWithKeys(fn ($user) => [$user->id => "{$user->name} <{$user->email}>"])
                    ->toArray(),
                placeholder: 'Search by name or email...',
                required: true,
            );
        } else {
            $user = User::find($userId);

            if (! $user) {
                $this->error("User with ID {$userId} not found.");

                return self::FAILURE;
            }
        }

        if (is_string($user)) {
            $user = User::find($user);
        }

        $roles = $this->option('role');

        if (empty($roles)) {
            $availableRoles = Role::query()->pluck('name')->toArray();

            if (empty($availableRoles)) {
                $this->warn('No roles available to assign.');

                return self::FAILURE;
            }

            $currentRoles = $user->roles->pluck('name')->toArray();

            $roles = multiselect(
                label: 'Select roles to assign',
                options: $availableRoles,
                default: $currentRoles,
                required: false,
            );
        }

        if (empty($roles)) {
            $this->info('No roles assigned.');

            return self::SUCCESS;
        }

        $user->syncRoles($roles);

        $this->info("Roles assigned to user [{$user->name} <{$user->email}>]: ".implode(', ', $roles));

        return self::SUCCESS;
    }
}
