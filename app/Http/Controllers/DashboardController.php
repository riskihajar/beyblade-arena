<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $hasAdminRole = Role::query()
            ->where('name', 'admin')
            ->where('guard_name', 'web')
            ->exists();

        $stats = [
            'total_users' => User::count(),
            'active_sessions' => DB::table('sessions')
                ->where('last_activity', '>', now()->subMinutes(30)->timestamp)
                ->count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'unverified_users' => User::whereNull('email_verified_at')->count(),
            'total_roles' => Role::count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_users_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            'new_users_month' => User::where('created_at', '>=', now()->subMonth())->count(),
            'admin_users' => $hasAdminRole ? User::role('admin')->count() : 0,
        ];

        $recentUsers = User::with('roles')
            ->latest()
            ->take(10)
            ->get();

        $userGrowthData = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        $roleDistribution = Role::withCount('users')
            ->get()
            ->map(fn ($role) => [
                'name' => $role->name,
                'count' => $role->users_count,
            ])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'userGrowthData' => $userGrowthData,
            'roleDistribution' => $roleDistribution,
        ]);
    }
}
