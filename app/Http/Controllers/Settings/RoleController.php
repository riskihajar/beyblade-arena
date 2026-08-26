<?php

namespace App\Http\Controllers\Settings;

use App\Exports\RolesExport;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class RoleController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('role.view');

        $query = Role::with('permissions')->withCount('users');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('sort')) {
            $sort = $request->input('sort');
            $direction = $request->input('direction', 'asc');
            $allowedSorts = ['name', 'created_at'];

            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
            }
        }

        $perPage = (int) $request->input('per_page', 10);

        // Build query params for pagination
        $queryParams = [];
        if ($request->filled('search')) {
            $queryParams['search'] = $request->input('search');
        }
        if ($request->filled('sort')) {
            $queryParams['sort'] = $request->input('sort');
            $queryParams['direction'] = $request->input('direction', 'asc');
        }
        if ($perPage !== 10) {
            $queryParams['per_page'] = $perPage;
        }

        $roles = $query->paginate($perPage)->appends($queryParams);

        $filters = $request->only(['search']);

        // Only include sort and direction if sort is present
        if ($request->filled('sort')) {
            $filters['sort'] = $request->input('sort');
            $filters['direction'] = $request->input('direction', 'asc');
        }

        if ($perPage !== 10) {
            $filters['per_page'] = $perPage;
        }

        return Inertia::render('settings/roles/index', [
            'roles' => $roles,
            'filters' => $filters,
        ]);
    }

    /**
     * Export roles to file (XLSX, CSV, or JSON).
     */
    public function export(Request $request)
    {
        $this->authorize('role.view');

        $filters = $request->only(['search']);
        $format = $request->input('format', 'xlsx');

        $allowedFormats = ['xlsx', 'csv', 'json'];
        if (! in_array($format, $allowedFormats)) {
            $format = 'xlsx';
        }

        $filename = 'roles-export-'.now()->format('Y-m-d-His');

        if ($format === 'json') {
            $roles = Role::with('permissions')
                ->withCount('users')
                ->when(isset($filters['search']) && ! empty($filters['search']), function ($query) use ($filters) {
                    $query->where('name', 'like', "%{$filters['search']}%");
                })
                ->latest()
                ->get()
                ->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'guard_name' => $role->guard_name,
                        'permissions_count' => $role->permissions->count(),
                        'permissions' => $role->permissions->pluck('name')->toArray(),
                        'users_count' => $role->users_count,
                        'created_at' => $role->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $role->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'data' => $roles,
                'exported_at' => now()->format('Y-m-d H:i:s'),
                'total_count' => $roles->count(),
            ])
                ->header('Content-Disposition', "attachment; filename=\"{$filename}.json\"")
                ->header('Content-Type', 'application/json');
        }

        $export = new RolesExport($filters);

        if ($format === 'csv') {
            return Excel::download($export, "{$filename}.csv", \Maatwebsite\Excel\Excel::CSV);
        }

        return Excel::download($export, "{$filename}.xlsx");
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('role.create');

        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        });

        return Inertia::render('settings/roles/create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('role.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        $role->givePermissionTo($validated['permissions']);

        return to_route('settings.roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $this->authorize('role.update');

        $role->load('permissions');
        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        });

        return Inertia::render('settings/roles/edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorize('role.update');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return to_route('settings.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $this->authorize('role.delete');

        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role with assigned users.');
        }

        $role->delete();

        return to_route('settings.roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
