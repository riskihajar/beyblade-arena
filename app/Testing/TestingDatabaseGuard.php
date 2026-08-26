<?php

namespace App\Testing;

use Illuminate\Contracts\Foundation\Application;
use RuntimeException;
use Symfony\Component\Console\Input\InputInterface;

class TestingDatabaseGuard
{
    private const DESTRUCTIVE_COMMANDS = [
        'db:wipe',
        'migrate:fresh',
        'migrate:refresh',
        'migrate:reset',
        'migrate:rollback',
    ];

    private const IDENTITY_KEYS = [
        'driver',
        'host',
        'port',
        'database',
        'unix_socket',
        'url',
        'prefix',
        'search_path',
    ];

    public static function assertApplicationIsSafe(Application $app): void
    {
        $configuration = $app->make('config');

        self::validate(
            environment: (string) $app->environment(),
            testingFlag: filter_var(env('DB_TESTING', false), FILTER_VALIDATE_BOOLEAN),
            defaultConnection: (string) $configuration->get('database.default'),
            connections: (array) $configuration->get('database.connections', []),
            applicationConnection: (string) env('DB_CONNECTION', 'sqlite'),
        );
    }

    public static function assertCommandIsSafe(
        Application $app,
        string $command,
        InputInterface $input,
    ): void {
        if (! in_array($command, self::DESTRUCTIVE_COMMANDS, true)) {
            return;
        }

        $targetConnection = $input->hasOption('database')
            ? $input->getOption('database')
            : null;

        $configuration = $app->make('config');

        self::validate(
            environment: (string) $app->environment(),
            testingFlag: filter_var(env('DB_TESTING', false), FILTER_VALIDATE_BOOLEAN),
            defaultConnection: (string) $configuration->get('database.default'),
            connections: (array) $configuration->get('database.connections', []),
            applicationConnection: (string) env('DB_CONNECTION', 'sqlite'),
            targetConnection: is_string($targetConnection) ? $targetConnection : null,
        );
    }

    /**
     * @param  array<string, array<string, mixed>>  $connections
     */
    public static function validate(
        string $environment,
        bool $testingFlag,
        string $defaultConnection,
        array $connections,
        string $applicationConnection,
        ?string $targetConnection = null,
    ): void {
        if ($environment !== 'testing' || ! $testingFlag) {
            throw new RuntimeException(
                'Destructive database operations are disabled unless APP_ENV=testing and DB_TESTING=true.',
            );
        }

        if ($defaultConnection !== 'testing') {
            throw new RuntimeException(
                'Testing requires database.default=testing; refusing to use the application database.',
            );
        }

        if ($targetConnection !== null && $targetConnection !== 'testing') {
            throw new RuntimeException(
                'Destructive database operations may target only the testing connection.',
            );
        }

        $testingConfiguration = $connections['testing'] ?? null;
        $applicationConfiguration = $connections[$applicationConnection] ?? null;

        if (! is_array($testingConfiguration) || ! is_array($applicationConfiguration)) {
            throw new RuntimeException(
                'Testing database configuration is incomplete; refusing to run database operations.',
            );
        }

        if (self::isBlank($testingConfiguration['driver'] ?? null)) {
            throw new RuntimeException(
                'TEST_DB_CONNECTION is required for the testing database.',
            );
        }

        if (self::isBlank($testingConfiguration['database'] ?? null)
            && self::isBlank($testingConfiguration['url'] ?? null)) {
            throw new RuntimeException(
                'TEST_DB_DATABASE or TEST_DB_URL is required for the testing database.',
            );
        }

        if (self::connectionsResolveToSameDatabase($testingConfiguration, $applicationConfiguration)) {
            throw new RuntimeException(
                'The testing connection resolves to the application database; configure a separate database or schema.',
            );
        }
    }

    /**
     * @param  array<string, mixed>  $testingConfiguration
     * @param  array<string, mixed>  $applicationConfiguration
     */
    private static function connectionsResolveToSameDatabase(
        array $testingConfiguration,
        array $applicationConfiguration,
    ): bool {
        if (self::connectionIdentity($testingConfiguration) === self::connectionIdentity($applicationConfiguration)) {
            return true;
        }

        if (! self::sameDriver($testingConfiguration, $applicationConfiguration)) {
            return false;
        }

        $driver = self::normalizedDriver($testingConfiguration['driver'] ?? null);
        $testingDatabase = $testingConfiguration['database'] ?? null;
        $applicationDatabase = $applicationConfiguration['database'] ?? null;

        if ($driver === 'pgsql'
            && ! self::isBlank($testingDatabase)
            && $testingDatabase === $applicationDatabase
            && ($testingConfiguration['search_path'] ?? null) !== ($applicationConfiguration['search_path'] ?? null)) {
            return false;
        }

        if (self::sameUrl($testingConfiguration, $applicationConfiguration)) {
            return true;
        }

        if (self::isBlank($testingDatabase) || self::isBlank($applicationDatabase)) {
            return false;
        }

        if (in_array($driver, ['mysql', 'sqlsrv'], true)) {
            return $testingDatabase === $applicationDatabase;
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $testingConfiguration
     * @param  array<string, mixed>  $applicationConfiguration
     */
    private static function sameDriver(array $testingConfiguration, array $applicationConfiguration): bool
    {
        return self::normalizedDriver($testingConfiguration['driver'] ?? null)
            === self::normalizedDriver($applicationConfiguration['driver'] ?? null);
    }

    private static function normalizedDriver(mixed $driver): ?string
    {
        if (! is_string($driver)) {
            return null;
        }

        return in_array($driver, ['mysql', 'mariadb'], true) ? 'mysql' : $driver;
    }

    /**
     * @param  array<string, mixed>  $testingConfiguration
     * @param  array<string, mixed>  $applicationConfiguration
     */
    private static function sameUrl(array $testingConfiguration, array $applicationConfiguration): bool
    {
        $testingUrl = $testingConfiguration['url'] ?? null;
        $applicationUrl = $applicationConfiguration['url'] ?? null;

        return ! self::isBlank($testingUrl) && $testingUrl === $applicationUrl;
    }

    /**
     * @param  array<string, mixed>  $connection
     * @return array<string, mixed>
     */
    private static function connectionIdentity(array $connection): array
    {
        $identity = [];

        foreach (self::IDENTITY_KEYS as $key) {
            $identity[$key] = $key === 'database'
                ? self::normalizeDatabasePath($connection['driver'] ?? null, $connection[$key] ?? null)
                : ($connection[$key] ?? null);
        }

        return $identity;
    }

    private static function normalizeDatabasePath(mixed $driver, mixed $database): mixed
    {
        if ($driver !== 'sqlite' || ! is_string($database) || self::isBlank($database)
            || $database === ':memory:' || str_contains($database, 'mode=memory')) {
            return $database;
        }

        if (str_starts_with($database, DIRECTORY_SEPARATOR)) {
            return realpath($database) ?: $database;
        }

        if (function_exists('base_path')) {
            $basePath = base_path($database);

            return realpath($basePath) ?: $basePath;
        }

        return realpath($database) ?: $database;
    }

    private static function isBlank(mixed $value): bool
    {
        return $value === null || (is_string($value) && trim($value) === '');
    }
}
