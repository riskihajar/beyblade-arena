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

    Permission::firstOrCreate(['name' => 'user.view']);
    Permission::firstOrCreate(['name' => 'user.create']);
    Permission::firstOrCreate(['name' => 'user.update']);
    Permission::firstOrCreate(['name' => 'user.delete']);
    Permission::firstOrCreate(['name' => 'admin.access']);

    $adminRole = Role::where('name', 'admin')->first();
    $adminRole->syncPermissions(Permission::all());
});

describe('pages rendering', function () {
    it('can list users', function () {
        User::factory()->create();

        $this->actingAs($this->user)->get('/settings/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/users/index')
                ->has('users.data')
            );
    });

    it('can show create user page', function () {
        Role::firstOrCreate(['name' => 'user']);

        $this->actingAs($this->user)->get('/settings/users/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/users/create')
                ->has('roles')
            );
    });

    it('can show edit user page', function () {
        $user = User::factory()->create();
        $user->assignRole('user');

        $this->actingAs($this->user)->get("/settings/users/{$user->id}/edit")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/users/edit')
                ->has('user')
                ->has('roles')
            );
    });

    it('can show user details with activity history', function () {
        $user = User::factory()->create();

        activity('admin')
            ->causedBy($this->user)
            ->performedOn($user)
            ->withProperties([
                'attributes' => ['name' => 'Updated Name'],
                'old' => ['name' => 'Old Name'],
            ])
            ->log('updated');

        activity('admin')
            ->causedBy($user)
            ->performedOn($this->user)
            ->withProperties([
                'attributes' => ['email' => 'new@example.com'],
                'old' => ['email' => 'old@example.com'],
            ])
            ->log('updated');

        $this->actingAs($this->user)->get("/settings/users/{$user->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/users/show')
                ->where('user.id', $user->id)
                ->has('activities.data')
                ->where('activities.data', function ($activities) use ($user) {
                    $subjectMatch = collect($activities)->contains(function ($activity) use ($user) {
                        return ($activity['subject_id'] ?? null) === $user->id
                            && ($activity['subject_type'] ?? null) === User::class;
                    });

                    $causerMatch = collect($activities)->contains(function ($activity) use ($user) {
                        return ($activity['causer_id'] ?? null) === $user->id
                            && ($activity['causer_type'] ?? null) === User::class;
                    });

                    return $subjectMatch && $causerMatch;
                })
            );
    });
});

describe('actions and mutations', function () {
    it('can create a user', function () {
        Role::firstOrCreate(['name' => 'user']);

        $this->actingAs($this->user)->post('/settings/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['user'],
        ])
            ->assertRedirect('/settings/users')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
        $user = User::where('email', 'newuser@example.com')->first();
        expect($user->hasRole('user'))->toBeTrue();
    });

    it('can update a user', function () {
        $user = User::factory()->create();
        $user->assignRole('user');
        Role::firstOrCreate(['name' => 'admin']);

        $this->actingAs($this->user)->put("/settings/users/{$user->id}", [
            'name' => 'Updated User',
            'email' => $user->email,
            'roles' => ['admin'],
        ])
            ->assertRedirect('/settings/users')
            ->assertSessionHas('success');

        $user->refresh();
        expect($user->hasRole('admin'))->toBeTrue();
    });

    it('cannot delete own account', function () {
        $this->actingAs($this->user)->delete("/settings/users/{$this->user->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $this->user->id]);
    });

    it('can delete another user', function () {
        $user = User::factory()->create();

        $this->actingAs($this->user)->delete("/settings/users/{$user->id}")
            ->assertRedirect('/settings/users')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    });

    it('validates user email is required', function () {
        Role::firstOrCreate(['name' => 'user']);

        $this->actingAs($this->user)->post('/settings/users', [
            'name' => 'Test User',
            'email' => '',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'user',
        ])
            ->assertInvalid(['email']);
    });

    it('validates user email is unique', function () {
        Role::firstOrCreate(['name' => 'user']);
        User::factory()->create(['email' => 'existing@example.com']);

        $this->actingAs($this->user)->post('/settings/users', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'user',
        ])
            ->assertInvalid(['email']);
    });

    it('can bulk delete users', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        $this->actingAs($this->user)->delete('/settings/users/bulk-destroy', [
            'ids' => [$user1->id, $user2->id, $user3->id],
        ])
            ->assertRedirect('/settings/users')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $user1->id]);
        $this->assertDatabaseMissing('users', ['id' => $user2->id]);
        $this->assertDatabaseMissing('users', ['id' => $user3->id]);
    });

    it('cannot bulk delete own account', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->actingAs($this->user)->delete('/settings/users/bulk-destroy', [
            'ids' => [$user1->id, $this->user->id, $user2->id],
        ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('users', ['id' => $user1->id]);
        $this->assertDatabaseHas('users', ['id' => $this->user->id]);
        $this->assertDatabaseHas('users', ['id' => $user2->id]);
    });

    it('validates bulk delete ids is required array', function () {
        $this->actingAs($this->user)->delete('/settings/users/bulk-destroy')
            ->assertInvalid(['ids']);
    });

    it('validates bulk delete ids must exist', function () {
        $user = User::factory()->create();

        $this->actingAs($this->user)->delete('/settings/users/bulk-destroy', [
            'ids' => [$user->id, 'non-existent-id'],
        ])
            ->assertInvalid(['ids.1']);
    });
});

describe('authorization', function () {
    it('non-admin user cannot access users management', function () {
        $user = User::factory()->create();
        $user->assignRole('user');

        $this->actingAs($user)->get('/settings/users')
            ->assertForbidden();
    });
});
