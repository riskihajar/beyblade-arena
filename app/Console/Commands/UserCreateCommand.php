<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class UserCreateCommand extends Command
{
    protected $description = 'Create a new user';

    protected $signature = 'user:create
                            {--name= : The name of the user}
                            {--email= : A valid and unique email address}
                            {--password= : The password for the user (min. 8 characters)}
                            {--role=* : Role(s) to assign to the user}';

    /**
     * @var array{'name': string | null, 'email': string | null, 'password': string | null}
     */
    protected array $options;

    /**
     * @return array{'name': string, 'email': string, 'password': string}
     */
    protected function getUserData(): array
    {
        return [
            'name' => $this->options['name'] ?? text(
                label: 'Name',
                required: true,
            ),

            'email' => $this->options['email'] ?? text(
                label: 'Email address',
                validate: fn (string $email): ?string => $email ? match (true) {
                    ! filter_var($email, FILTER_VALIDATE_EMAIL) => 'The email address must be valid.',
                    User::where('email', $email)->exists() => 'A user with this email address already exists',
                    default => null,
                }
                : null,
            ),

            'password' => Hash::make($this->options['password'] ?? password(
                label: 'Password',
                required: true,
            )),
        ];
    }

    public function handle(): int
    {
        $this->options = $this->options();

        $data = $this->getUserData();

        $user = User::create($data);

        $roles = $this->getRoles();

        if (! empty($roles)) {
            $user->assignRole($roles);
            $this->info('Roles assigned: '.implode(', ', $roles));
        }

        $this->info("User created successfully [ID: {$user->id}]");

        return self::SUCCESS;
    }

    protected function getRoles(): array
    {
        $optionRoles = $this->option('role');

        if (! empty($optionRoles)) {
            return $optionRoles;
        }

        $availableRoles = Role::query()->pluck('name')->toArray();

        if (empty($availableRoles)) {
            $this->warn('No roles available to assign.');

            return [];
        }

        return multiselect(
            label: 'Select roles to assign',
            options: $availableRoles,
            required: false,
        );
    }
}
