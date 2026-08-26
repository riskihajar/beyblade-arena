<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    /**
     * Search users and activities.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim()->value();

        if (mb_strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $results = [];

        // Search users - accessible to all authenticated users
        $users = User::search($query)->take(5)->get();

        if ($users->isNotEmpty()) {
            $results[] = [
                'type' => 'users',
                'label' => 'Users',
                'items' => $users->map(fn (User $user) => [
                    'id' => $user->id,
                    'label' => $user->name,
                    'description' => $user->email,
                    'href' => route('settings.users.show', $user),
                ])->all(),
            ];
        }

        // Search activities - only for users with admin.access permission
        if ($request->user()?->can('admin.access')) {
            $activities = Activity::search($query)->take(5)->get();

            if ($activities->isNotEmpty()) {
                $results[] = [
                    'type' => 'activities',
                    'label' => 'Activities',
                    'items' => $activities->map(fn (Activity $activity) => [
                        'id' => $activity->id,
                        'label' => $activity->description,
                        'description' => $activity->log_name.' - '.$activity->event,
                        'href' => route('settings.activities.show', $activity),
                    ])->all(),
                ];
            }
        }

        return response()->json(['results' => $results]);
    }
}
