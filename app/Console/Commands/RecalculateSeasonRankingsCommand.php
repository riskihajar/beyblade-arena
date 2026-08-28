<?php

namespace App\Console\Commands;

use App\Models\Season;
use App\Services\SeasonRankingCalculatorService;
use Illuminate\Console\Command;

class RecalculateSeasonRankingsCommand extends Command
{
    protected $signature = 'tournament:recalculate-rankings {season? : ID or slug of the season}';

    protected $description = 'Recalculate season leaderboard rankings and point audit history.';

    public function handle(SeasonRankingCalculatorService $calculator): int
    {
        $seasonIdentifier = $this->argument('season');

        if ($seasonIdentifier) {
            $seasons = Season::where('id', $seasonIdentifier)
                ->orWhere('slug', $seasonIdentifier)
                ->get();
        } else {
            $seasons = Season::all();
        }

        if ($seasons->isEmpty()) {
            $this->warn('Tidak ada musim turnamen yang ditemukan untuk dikalkulasi.');

            return Command::SUCCESS;
        }

        foreach ($seasons as $season) {
            $this->info("Mengalkulasi ranking untuk musim: {$season->name}...");
            $rankings = $calculator->recalculate($season);
            $this->line("  -> Berhasil memperbarui {$rankings->count()} ranking blader.");
        }

        $this->info('Kalkulasi seluruh ranking musim selesai!');

        return Command::SUCCESS;
    }
}
