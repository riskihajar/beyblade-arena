<?php

namespace Database\Seeders;

use App\Enums\TournamentPermissionEnum;
use App\Enums\UserRoleEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = TournamentPermissionEnum::values();

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => UserRoleEnum::ADMIN->value]);
        $adminRole->syncPermissions(Permission::all());

        $organizerRole = Role::firstOrCreate(['name' => UserRoleEnum::ORGANIZER->value]);
        $organizerRole->syncPermissions([
            TournamentPermissionEnum::ADMIN_ACCESS->value,
            TournamentPermissionEnum::TOURNAMENT_VIEW->value,
            TournamentPermissionEnum::TOURNAMENT_CREATE->value,
            TournamentPermissionEnum::TOURNAMENT_UPDATE->value,
            TournamentPermissionEnum::TOURNAMENT_DELETE->value,
            TournamentPermissionEnum::TOURNAMENT_MANAGE_BRACKETS->value,
            TournamentPermissionEnum::TOURNAMENT_CHECKIN->value,
            TournamentPermissionEnum::STADIUM_MANAGE->value,
            TournamentPermissionEnum::SEASON_MANAGE->value,
            TournamentPermissionEnum::RULESET_MANAGE->value,
            TournamentPermissionEnum::USER_VIEW->value,
        ]);

        $judgeRole = Role::firstOrCreate(['name' => UserRoleEnum::JUDGE->value]);
        $judgeRole->syncPermissions([
            TournamentPermissionEnum::ADMIN_ACCESS->value,
            TournamentPermissionEnum::TOURNAMENT_VIEW->value,
            TournamentPermissionEnum::TOURNAMENT_JUDGE->value,
            TournamentPermissionEnum::TOURNAMENT_CHECKIN->value,
        ]);

        $bladerRole = Role::firstOrCreate(['name' => UserRoleEnum::BLADER->value]);
        $bladerRole->syncPermissions([
            TournamentPermissionEnum::USER_VIEW->value,
            TournamentPermissionEnum::TOURNAMENT_VIEW->value,
        ]);

        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions([
            TournamentPermissionEnum::USER_VIEW->value,
            TournamentPermissionEnum::TOURNAMENT_VIEW->value,
        ]);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
