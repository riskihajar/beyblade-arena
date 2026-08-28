<?php

namespace App\Http\Controllers\Admin;

use App\Exports\RegistrationsExport;
use App\Exports\SeasonLeaderboardExport;
use App\Exports\TournamentResultsExport;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Season;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportController extends Controller
{
    public function exportRegistrations(Event $event): BinaryFileResponse
    {
        $this->authorize('view', $event);

        $slug = Str::slug($event->name);
        $filename = "pendaftar-{$slug}-".now()->format('Ymd_His').'.csv';

        return Excel::download(new RegistrationsExport($event->id), $filename);
    }

    public function exportResults(Event $event): BinaryFileResponse
    {
        $this->authorize('view', $event);

        $slug = Str::slug($event->name);
        $filename = "hasil-turnamen-{$slug}-".now()->format('Ymd_His').'.csv';

        return Excel::download(new TournamentResultsExport($event->id), $filename);
    }

    public function exportLeaderboard(Season $season): BinaryFileResponse
    {
        $slug = Str::slug($season->name);
        $filename = "leaderboard-{$slug}-".now()->format('Ymd_His').'.csv';

        return Excel::download(new SeasonLeaderboardExport($season->id), $filename);
    }
}
