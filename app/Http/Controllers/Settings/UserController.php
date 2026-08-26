<?php

namespace App\Http\Controllers\Settings;

use App\Exports\UsersExport;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('user.view');

        $query = User::with('roles');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $status = $request->input('status');
            if ($status === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($status === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        if ($request->has('sort')) {
            $sort = $request->input('sort');
            $direction = $request->input('direction', 'asc');
            $allowedSorts = ['name', 'email', 'email_verified_at', 'created_at'];

            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
            }
        }

        if ($request->wantsJson()) {
            return response()->json(
                $query->select(['id', 'name', 'email'])
                    ->limit(20)
                    ->get()
                    ->map(function ($user) {
                        return [
                            'value' => $user->id,
                            'label' => $user->name,
                            'email' => $user->email,
                            'avatar_url' => $user->avatar_url,
                        ];
                    })
            );
        }

        $perPage = $request->input('per_page', 10);

        // Build query params for pagination
        $queryParams = [];
        if ($request->filled('search')) {
            $queryParams['search'] = $request->input('search');
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $queryParams['status'] = $request->input('status');
        }
        if ($request->filled('sort')) {
            $queryParams['sort'] = $request->input('sort');
            $queryParams['direction'] = $request->input('direction', 'asc');
        }
        if ($perPage != 10) {
            $queryParams['per_page'] = $perPage;
        }

        $users = $query->paginate($perPage)->appends($queryParams);

        $filters = $request->only(['search', 'status']);

        if ($perPage !== 10) {
            $filters['per_page'] = $perPage;
        }

        // Only include sort and direction if sort is present
        if ($request->filled('sort')) {
            $filters['sort'] = $request->input('sort');
            $filters['direction'] = $request->input('direction', 'asc');
        }

        return Inertia::render('settings/users/index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    /**
     * Export users to file (XLSX, CSV, or JSON).
     */
    public function export(Request $request)
    {
        $this->authorize('user.view');

        $filters = $request->only(['search', 'status']);
        $format = $request->input('format', 'xlsx');

        $allowedFormats = ['xlsx', 'csv', 'json'];
        if (! in_array($format, $allowedFormats)) {
            $format = 'xlsx';
        }

        $filename = 'users-export-'.now()->format('Y-m-d-His');

        if ($format === 'json') {
            $users = User::with('roles')
                ->when(isset($filters['search']) && ! empty($filters['search']), function ($query) use ($filters) {
                    $search = $filters['search'];
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->when(isset($filters['status']) && ! empty($filters['status']), function ($query) use ($filters) {
                    if ($filters['status'] === 'verified') {
                        $query->whereNotNull('email_verified_at');
                    } elseif ($filters['status'] === 'unverified') {
                        $query->whereNull('email_verified_at');
                    }
                })
                ->latest()
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->roles->pluck('name')->toArray(),
                        'email_verified' => (bool) $user->email_verified_at,
                        'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'data' => $users,
                'exported_at' => now()->format('Y-m-d H:i:s'),
                'total_count' => $users->count(),
            ])
                ->header('Content-Disposition', "attachment; filename=\"{$filename}.json\"")
                ->header('Content-Type', 'application/json');
        }

        $export = new UsersExport($filters);

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
        $this->authorize('user.create');

        $roles = Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => Str::headline($role->name),
            ];
        });

        return Inertia::render('settings/users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('user.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['roles']);

        return to_route('settings.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, User $user): InertiaResponse
    {
        $this->authorize('user.view');

        $user->load('roles');

        $query = Activity::with('causer:id,name,email,avatar_path', 'subject')
            ->where(function ($activityQuery) use ($user) {
                $activityQuery
                    ->where(function ($subjectQuery) use ($user) {
                        $subjectQuery->where('subject_type', User::class)
                            ->where('subject_id', $user->id);
                    })
                    ->orWhere(function ($causerQuery) use ($user) {
                        $causerQuery->where('causer_type', User::class)
                            ->where('causer_id', $user->id);
                    });
            });

        if ($request->filled('event')) {
            $event = $request->input('event');
            $query->where('description', 'like', "%{$event}%");
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        $perPage = (int) $request->input('per_page', 10);

        $queryParams = [];
        if ($request->filled('event')) {
            $queryParams['event'] = $request->input('event');
        }
        if ($request->filled('date_from')) {
            $queryParams['date_from'] = $request->input('date_from');
        }
        if ($request->filled('date_to')) {
            $queryParams['date_to'] = $request->input('date_to');
        }
        if ($perPage !== 10) {
            $queryParams['per_page'] = $perPage;
        }

        $activities = $query->latest()->paginate($perPage)->appends($queryParams);

        return Inertia::render('settings/users/show', [
            'user' => $user,
            'activities' => $activities,
            'filters' => [
                'event' => $request->input('event'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $this->authorize('user.update');

        $user->load('roles');
        $roles = Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => Str::headline($role->name),
            ];
        });

        return Inertia::render('settings/users/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('user.update');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => data_get($validated, 'password') ? Hash::make($validated['password']) : $user->password,
        ]);

        $user->syncRoles($validated['roles']);

        return to_route('settings.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('user.delete');

        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return to_route('settings.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Remove the specified resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $this->authorize('user.delete');

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        $ids = $validated['ids'];

        // Prevent deleting self
        if (in_array(Auth::id(), $ids)) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        User::whereIn('id', $ids)->delete();

        return to_route('settings.users.index')
            ->with('success', count($ids).' users deleted successfully.');
    }

    /**
     * Mark the specified user's email as verified.
     */
    public function verify(User $user)
    {
        $this->authorize('user.update');

        if ($user->hasVerifiedEmail()) {
            return back()->with('info', 'User email is already verified.');
        }

        $user->markEmailAsVerified();

        return back()->with('success', 'User email has been verified.');
    }

    /**
     * Mark the specified user's email as unverified.
     */
    public function unverify(User $user)
    {
        $this->authorize('user.update');

        if (! $user->hasVerifiedEmail()) {
            return back()->with('info', 'User email is already unverified.');
        }

        $user->forceFill(['email_verified_at' => null])->save();

        return back()->with('success', 'User email has been unverified.');
    }
}
