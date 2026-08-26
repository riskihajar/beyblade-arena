<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;
use Spatie\Permission\PermissionRegistrar;

use function Laravel\Prompts\confirm;

class UserGenerateRolesCommand extends Command
{
    protected $description = 'Generate default roles and permissions';

    protected $signature = 'user:generate-roles';

    public function handle(): int
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $hasRoles = Role::query()->exists();

        if ($hasRoles) {
            $truncate = confirm(
                label: 'Roles table is not empty. Do you want to truncate it?',
                default: false,
            );

            if (! $truncate) {
                $this->info('Operation cancelled.');

                return self::SUCCESS;
            }

            Role::query()->truncate();
            Permission::query()->truncate();

            $this->info('Roles and permissions truncated.');
        }

        $this->seedRolesAndPermissions();

        return self::SUCCESS;
    }

    protected function seedRolesAndPermissions(): void
    {
        $permissions = [
            'user.view',
            'user.create',
            'user.update',
            'user.delete',
            'role.view',
            'role.create',
            'role.update',
            'role.delete',
            'admin.access',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions($permissions);

        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions([
            'user.view',
        ]);

        $this->info('Roles and permissions seeded successfully!');
    }
}
