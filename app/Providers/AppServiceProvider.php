<?php

namespace App\Providers;

use App\Ai\DatabaseConversationStore;
use App\Testing\TestingDatabaseGuard;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use Laravel\Ai\Contracts\ConversationStore;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(ConversationStore::class, DatabaseConversationStore::class);
    }

    public function boot(): void
    {
        Model::preventLazyLoading(! app()->isProduction());

        $this->registerTestingDatabaseGuard();
    }

    private function registerTestingDatabaseGuard(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        $app = $this->app;

        $app['events']->listen(CommandStarting::class, function (CommandStarting $event) use ($app): void {
            TestingDatabaseGuard::assertCommandIsSafe($app, $event->command, $event->input);
        });
    }
}
