<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'notifications' => $request->user() ? $request->user()->notifications()->latest()->take(10)->get() : [],
                'unreadCount' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name')->toArray() : [],
            ],
            'globalSearch' => [
                'groups' => $this->globalSearchGroups($request),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * @return array<int, array{label: string, items: array<int, array{label: string, href: string, keywords: array<int, string>}>}>
     */
    private function globalSearchGroups(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [];
        }

        $groups = [
            [
                'label' => 'Main',
                'items' => [
                    [
                        'label' => 'Dashboard',
                        'href' => route('dashboard', absolute: false),
                        'keywords' => ['home', 'overview'],
                    ],
                    [
                        'label' => 'Turnamen & Event',
                        'href' => route('admin.events.index', absolute: false),
                        'keywords' => ['tournament', 'event', 'kompetisi'],
                    ],
                    [
                        'label' => 'Arena & Panggilan',
                        'href' => route('admin.stadiums.index', absolute: false),
                        'keywords' => ['stadium', 'arena', 'panggilan'],
                    ],
                    [
                        'label' => 'Konsol Wasit & Juri',
                        'href' => route('judge.console', absolute: false),
                        'keywords' => ['judge', 'wasit', 'scorepad', 'scoring'],
                    ],
                ],
            ],
            [
                'label' => 'Settings',
                'items' => [
                    [
                        'label' => 'Profile',
                        'href' => route('profile.edit', absolute: false),
                        'keywords' => ['account', 'user'],
                    ],
                    [
                        'label' => 'Password',
                        'href' => route('user-password.edit', absolute: false),
                        'keywords' => ['security', 'credentials'],
                    ],
                    [
                        'label' => 'Two-Factor Auth',
                        'href' => route('two-factor.show', absolute: false),
                        'keywords' => ['2fa', 'security'],
                    ],
                    [
                        'label' => 'Appearance',
                        'href' => route('appearance.edit', absolute: false),
                        'keywords' => ['theme', 'dark', 'light'],
                    ],
                ],
            ],
        ];

        if ($user->can('admin.access')) {
            $groups[] = [
                'label' => 'Admin',
                'items' => [
                    [
                        'label' => 'Users',
                        'href' => route('settings.users.index', absolute: false),
                        'keywords' => ['user management', 'members'],
                    ],
                    [
                        'label' => 'Roles',
                        'href' => route('settings.roles.index', absolute: false),
                        'keywords' => ['permissions', 'access control'],
                    ],
                    [
                        'label' => 'Activities',
                        'href' => route('settings.activities.index', absolute: false),
                        'keywords' => ['audit', 'logs'],
                    ],
                ],
            ];
        }

        return $groups;
    }
}
