<?php

use App\Ai\Tools\DatabaseSchemaTool;
use Laravel\Ai\Tools\Request;

test('database schema tool has description', function () {
    $tool = new DatabaseSchemaTool;

    expect($tool->description())->toBeString();
    expect((string) $tool->description())->toContain('schema');
});

test('database schema tool has schema method', function () {
    $tool = new DatabaseSchemaTool;

    expect(method_exists($tool, 'schema'))->toBeTrue();
});

test('database schema tool returns all tables', function () {
    $tool = new DatabaseSchemaTool;

    $result = $tool->handle(new Request([]));

    $decoded = json_decode($result, true);
    expect($decoded)->toBeArray();
    expect($decoded)->toHaveKey('users');
});

test('database schema tool returns column types for tables', function () {
    $tool = new DatabaseSchemaTool;

    $result = $tool->handle(new Request([]));

    $decoded = json_decode($result, true);
    expect($decoded['users'])->toHaveKey('id');
    expect($decoded['users'])->toHaveKey('email');
    expect($decoded['users'])->toHaveKey('name');
});

test('database schema tool filters tables by name', function () {
    $tool = new DatabaseSchemaTool;

    $result = $tool->handle(new Request(['filter' => 'user']));

    $decoded = json_decode($result, true);
    expect($decoded)->toBeArray();
    expect($decoded)->toHaveKey('users');

    foreach (array_keys($decoded) as $tableName) {
        expect(strtolower($tableName))->toContain('user');
    }
});

test('database schema tool returns empty for non-existent filter', function () {
    $tool = new DatabaseSchemaTool;

    $result = $tool->handle(new Request(['filter' => 'nonexistenttable_xyz']));

    $decoded = json_decode($result, true);
    expect($decoded)->toBeEmpty();
});

test('database schema tool handles empty filter as no filter', function () {
    $tool = new DatabaseSchemaTool;

    $allResult = $tool->handle(new Request([]));
    $emptyFilterResult = $tool->handle(new Request(['filter' => '']));

    expect($allResult)->toBe($emptyFilterResult);
});
