<?php

use App\Testing\TestingDatabaseGuard;

function isolatedTestingDatabaseConnections(): array
{
    return [
        'testing' => [
            'driver' => 'sqlite',
            'database' => ':memory:',
        ],
        'sqlite' => [
            'driver' => 'sqlite',
            'database' => '/tmp/application.sqlite',
        ],
    ];
}

test('accepts an isolated testing database', function () {
    TestingDatabaseGuard::validate(
        environment: 'testing',
        testingFlag: true,
        defaultConnection: 'testing',
        connections: isolatedTestingDatabaseConnections(),
        applicationConnection: 'sqlite',
    );

    expect(true)->toBeTrue();
});

test('accepts each supported database driver for testing', function (string $driver) {
    $connections = isolatedTestingDatabaseConnections();
    $connections['testing']['driver'] = $driver;

    TestingDatabaseGuard::validate(
        environment: 'testing',
        testingFlag: true,
        defaultConnection: 'testing',
        connections: $connections,
        applicationConnection: 'sqlite',
    );

    expect(true)->toBeTrue();
})->with([
    'sqlite',
    'mysql',
    'mariadb',
    'pgsql',
    'sqlsrv',
]);

test('rejects an unsafe testing setup', function (
    string $environment,
    bool $testingFlag,
    string $defaultConnection,
    ?string $targetConnection,
    string $message,
) {
    expect(fn () => TestingDatabaseGuard::validate(
        environment: $environment,
        testingFlag: $testingFlag,
        defaultConnection: $defaultConnection,
        connections: isolatedTestingDatabaseConnections(),
        applicationConnection: 'sqlite',
        targetConnection: $targetConnection,
    ))->toThrow(RuntimeException::class, $message);
})->with([
    'non testing environment' => [
        'local', true, 'testing', null,
        'APP_ENV=testing and DB_TESTING=true',
    ],
    'testing flag disabled' => [
        'testing', false, 'testing', null,
        'APP_ENV=testing and DB_TESTING=true',
    ],
    'application connection is default' => [
        'testing', true, 'sqlite', null,
        'database.default=testing',
    ],
    'command targets application connection' => [
        'testing', true, 'testing', 'sqlite',
        'may target only the testing connection',
    ],
]);

test('rejects a testing connection that resolves to the application database', function () {
    $connections = isolatedTestingDatabaseConnections();
    $connections['testing']['database'] = $connections['sqlite']['database'];

    expect(fn () => TestingDatabaseGuard::validate(
        environment: 'testing',
        testingFlag: true,
        defaultConnection: 'testing',
        connections: $connections,
        applicationConnection: 'sqlite',
    ))->toThrow(RuntimeException::class, 'resolves to the application database');
});

test('rejects equivalent mysql databases with different host aliases', function () {
    $connections = [
        'testing' => [
            'driver' => 'mysql',
            'host' => 'localhost',
            'port' => 3306,
            'database' => 'application',
        ],
        'mysql' => [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'port' => 3306,
            'database' => 'application',
        ],
    ];

    expect(fn () => TestingDatabaseGuard::validate(
        environment: 'testing',
        testingFlag: true,
        defaultConnection: 'testing',
        connections: $connections,
        applicationConnection: 'mysql',
    ))->toThrow(RuntimeException::class, 'resolves to the application database');
});

test('rejects identical database URLs', function () {
    $connections = [
        'testing' => [
            'driver' => 'mysql',
            'url' => 'mysql://root:password@localhost/testing',
            'database' => 'testing',
        ],
        'mysql' => [
            'driver' => 'mysql',
            'url' => 'mysql://root:password@localhost/testing',
            'database' => 'application',
        ],
    ];

    expect(fn () => TestingDatabaseGuard::validate(
        environment: 'testing',
        testingFlag: true,
        defaultConnection: 'testing',
        connections: $connections,
        applicationConnection: 'mysql',
    ))->toThrow(RuntimeException::class, 'resolves to the application database');
});

test('allows a postgres schema dedicated to testing', function () {
    $connections = [
        'testing' => [
            'driver' => 'pgsql',
            'host' => '127.0.0.1',
            'port' => 5432,
            'database' => 'application',
            'search_path' => 'testing',
        ],
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => '127.0.0.1',
            'port' => 5432,
            'database' => 'application',
            'search_path' => 'public',
        ],
    ];

    TestingDatabaseGuard::validate(
        environment: 'testing',
        testingFlag: true,
        defaultConnection: 'testing',
        connections: $connections,
        applicationConnection: 'pgsql',
    );

    expect(true)->toBeTrue();
});
