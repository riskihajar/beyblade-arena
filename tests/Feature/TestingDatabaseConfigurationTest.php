<?php

use App\Testing\TestingDatabaseGuard;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputDefinition;
use Symfony\Component\Console\Input\InputOption;

test('feature tests use the isolated testing connection', function () {
    expect(config('database.default'))->toBe('testing')
        ->and(config('database.connections.testing.driver'))->toBeString()
        ->and(config('database.connections.testing.database') ?: config('database.connections.testing.url'))->not->toBeEmpty()
        ->and(config('queue.connections.database.connection'))->toBe('testing')
        ->and(config('queue.batching.database'))->toBe('testing')
        ->and(config('queue.failed.database'))->toBe('testing')
        ->and(config('session.connection'))->toBe('testing')
        ->and(config('cache.stores.database.connection'))->toBe('testing')
        ->and(config('cache.stores.database.lock_connection'))->toBe('testing')
        ->and(config('activitylog.database_connection'))->toBe('testing');
});

test('destructive commands may target only the testing connection', function () {
    $input = new ArrayInput(
        ['--database' => 'sqlite'],
        new InputDefinition([
            new InputOption('database', null, InputOption::VALUE_OPTIONAL),
        ]),
    );

    expect(fn () => TestingDatabaseGuard::assertCommandIsSafe($this->app, 'migrate:fresh', $input))
        ->toThrow('may target only the testing connection');
});
