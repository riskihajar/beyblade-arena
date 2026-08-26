<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'user']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');

    Permission::firstOrCreate(['name' => 'role.view']);
    Permission::firstOrCreate(['name' => 'role.create']);
    Permission::firstOrCreate(['name' => 'role.update']);
    Permission::firstOrCreate(['name' => 'role.delete']);
    Permission::firstOrCreate(['name' => 'admin.access']);

    $adminRole = Role::where('name', 'admin')->first();
    $adminRole->syncPermissions(Permission::all());
});

describe('pages rendering', function () {
    it('can list roles', function () {
        Role::create(['name' => 'Test Role']);

        $this->actingAs($this->user)->get('/settings/roles')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/roles/index')
                ->has('roles')
            );
    });

    it('can show create role page', function () {
        $this->actingAs($this->user)->get('/settings/roles/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/roles/create')
                ->has('permissions')
            );
    });

    it('can show edit role page', function () {
        $role = Role::create(['name' => 'Test Role']);

        $this->actingAs($this->user)->get("/settings/roles/{$role->id}/edit")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/roles/edit')
                ->has('role')
                ->has('permissions')
            );
    });
});

describe('actions and mutations', function () {
    it('can create a role', function () {
        $this->actingAs($this->user)->post('/settings/roles', [
            'name' => 'New Role',
            'permissions' => ['role.view', 'role.create'],
        ])
            ->assertRedirect('/settings/roles')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('roles', ['name' => 'New Role']);
        $role = Role::where('name', 'New Role')->first();
        expect($role->hasPermissionTo('role.view'))->toBeTrue();
        expect($role->hasPermissionTo('role.create'))->toBeTrue();
    });

    it('can update a role', function () {
        $role = Role::create(['name' => 'Test Role']);
        $role->givePermissionTo('role.view');

        $this->actingAs($this->user)->put("/settings/roles/{$role->id}", [
            'name' => 'Updated Role',
            'permissions' => ['role.view', 'role.update'],
        ])
            ->assertRedirect('/settings/roles')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('roles', ['name' => 'Updated Role']);
        $role->refresh();
        expect($role->hasPermissionTo('role.update'))->toBeTrue();
    });

    it('cannot delete role with assigned users', function () {
        $role = Role::create(['name' => 'Test Role']);
        $this->user->assignRole($role);

        $this->actingAs($this->user)->delete("/settings/roles/{$role->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    });

    it('can delete a role without users', function () {
        $role = Role::create(['name' => 'Test Role']);

        $this->actingAs($this->user)->delete("/settings/roles/{$role->id}")
            ->assertRedirect('/settings/roles')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    });

    it('validates role name is required', function () {
        $this->actingAs($this->user)->post('/settings/roles', [
            'name' => '',
            'permissions' => ['role.view'],
        ])
            ->assertInvalid(['name']);
    });

    it('validates role name is unique', function () {
        Role::create(['name' => 'Existing Role']);

        $this->actingAs($this->user)->post('/settings/roles', [
            'name' => 'Existing Role',
            'permissions' => ['role.view'],
        ])
            ->assertInvalid(['name']);
    });
});

describe('authorization', function () {
    it('non-admin user cannot access roles management', function () {
        $user = User::factory()->create();
        $user->assignRole('user');

        $this->actingAs($user)->get('/settings/roles')
            ->assertForbidden();
    });
});
