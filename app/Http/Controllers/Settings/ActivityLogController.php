<?php

namespace App\Http\Controllers\Settings;

use App\Enums\LogType;
use App\Exports\ActivityLogsExport;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Maatwebsite\Excel\Facades\Excel;

class ActivityLogController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): InertiaResponse
    {
        $this->authorize('admin.access');

        $query = Activity::with('causer:id,name,email,avatar_path');

        $filter = $request->input('filter');
        $sort = $request->input('sort');
        $direction = $request->input('direction', 'desc');

        if ($filter) {
            match ($filter) {
                'all' => null,
                'user' => $query->inLog('default'),
                'admin' => $query->inLog('admin'),
                'authentication' => $query->inLog('authentication'),
                default => $query->inLog('default'),
            };
        }

        if ($request->filled('event')) {
            $query->forEvent($request->input('event'));
        }

        if ($request->filled('user_id')) {
            $userIds = (array) $request->input('user_id');
            $query->whereIn('causer_id', $userIds)
                ->where('causer_type', User::class);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        $allowedSorts = ['description', 'log_name', 'subject_type', 'created_at'];
        if ($sort && in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $perPage = (int) $request->input('per_page', 10);

        $queryParams = [];
        if ($filter && $filter !== 'all') {
            $queryParams['filter'] = $filter;
        }
        if ($request->filled('event')) {
            $queryParams['event'] = $request->input('event');
        }
        if ($request->filled('user_id')) {
            $queryParams['user_id'] = $request->input('user_id');
        }
        if ($request->filled('date_from')) {
            $queryParams['date_from'] = $request->input('date_from');
        }
        if ($request->filled('date_to')) {
            $queryParams['date_to'] = $request->input('date_to');
        }
        if ($request->filled('sort') && in_array($sort, $allowedSorts, true)) {
            $queryParams['sort'] = $sort;
            $queryParams['direction'] = $direction;
        }
        if ($perPage !== 10) {
            $queryParams['per_page'] = $perPage;
        }

        $activities = $query->paginate($perPage)->appends($queryParams);

        // Get selected users for filter display
        $selectedUsers = [];
        if ($request->filled('user_id')) {
            $userIds = (array) $request->input('user_id');
            $users = User::whereIn('id', $userIds)->get(['id', 'name']);
            $selectedUsers = $users->map(fn ($user) => [
                'value' => $user->id,
                'label' => $user->name,
            ])->toArray();
        }

        return Inertia::render('settings/activities/index', [
            'activities' => $activities,
            'logTypes' => LogType::toSelectOptions(),
            'selectedUser' => $selectedUsers,
            'filters' => [
                'filter' => $filter ?? 'all',
                'event' => $request->input('event'),
                'user_id' => $request->input('user_id'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
                'per_page' => $perPage,
                'sort' => $request->filled('sort') && in_array($sort, $allowedSorts, true) ? $sort : null,
                'direction' => $request->filled('sort') && in_array($sort, $allowedSorts, true) ? $direction : null,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $this->authorize('admin.access');

        $filters = $request->only(['filter', 'event', 'user_id', 'date_from', 'date_to', 'sort', 'direction']);
        $format = $request->input('format', 'xlsx');

        $allowedFormats = ['xlsx', 'csv', 'json'];
        if (! in_array($format, $allowedFormats)) {
            $format = 'xlsx';
        }

        $filename = 'activity-logs-export-'.now()->format('Y-m-d-His');

        if ($format === 'json') {
            $activities = Activity::with('causer:id,name,email')
                ->when(isset($filters['filter']) && ! empty($filters['filter']) && $filters['filter'] !== 'all', function ($query) use ($filters) {
                    $filter = $filters['filter'];
                    match ($filter) {
                        'user' => $query->inLog('default'),
                        'admin' => $query->inLog('admin'),
                        'authentication' => $query->inLog('authentication'),
                        default => null,
                    };
                })
                ->when(! empty($filters['event']), function ($query) use ($filters) {
                    $query->forEvent($filters['event']);
                })
                ->when(! empty($filters['user_id']), function ($query) use ($filters) {
                    $userIds = (array) $filters['user_id'];
                    $query->whereIn('causer_id', $userIds)
                        ->where('causer_type', User::class);
                })
                ->when(! empty($filters['date_from']), function ($query) use ($filters) {
                    $query->where('created_at', '>=', $filters['date_from']);
                })
                ->when(! empty($filters['date_to']), function ($query) use ($filters) {
                    $query->where('created_at', '<=', $filters['date_to']);
                })
                ->when(! empty($filters['sort']), function ($query) use ($filters) {
                    $sort = $filters['sort'];
                    $direction = $filters['direction'] ?? 'desc';
                    $allowedSorts = ['description', 'log_name', 'subject_type', 'created_at'];
                    if (in_array($sort, $allowedSorts)) {
                        $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
                    }
                })
                ->latest()
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'log_name' => $activity->log_name ?? 'default',
                        'event' => $activity->event ?? 'N/A',
                        'description' => $activity->description,
                        'causer_name' => $activity->causer?->name ?? 'System',
                        'causer_email' => $activity->causer?->email ?? 'N/A',
                        'subject_type' => $activity->subject_type ?? 'N/A',
                        'subject_id' => $activity->subject_id ?? 'N/A',
                        'properties' => $activity->properties,
                        'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'data' => $activities,
                'exported_at' => now()->format('Y-m-d H:i:s'),
                'total_count' => $activities->count(),
            ])
                ->header('Content-Disposition', "attachment; filename=\"{$filename}.json\"")
                ->header('Content-Type', 'application/json');
        }

        $export = new ActivityLogsExport($filters);

        if ($format === 'csv') {
            return Excel::download($export, "{$filename}.csv", \Maatwebsite\Excel\Excel::CSV);
        }

        return Excel::download($export, "{$filename}.xlsx");
    }

    public function show(Activity $activity): InertiaResponse
    {
        $this->authorize('admin.access');

        $activity->load('causer:id,name,email,avatar_path', 'subject');

        return Inertia::render('settings/activities/show', [
            'activity' => $activity,
        ]);
    }
}
