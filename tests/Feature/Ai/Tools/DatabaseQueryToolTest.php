<?php

use App\Ai\Tools\DatabaseQueryTool;
use Laravel\Ai\Tools\Request;

test('database query tool has description', function () {
    $tool = new DatabaseQueryTool;

    expect($tool->description())->toBeString();
    expect((string) $tool->description())->toContain('read-only');
});

test('database query tool has schema method', function () {
    $tool = new DatabaseQueryTool;

    expect(method_exists($tool, 'schema'))->toBeTrue();
});

test('database query tool executes select query', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => 'SELECT 1 as test_value']));

    $decoded = json_decode($result, true);
    expect($decoded)->toBeArray();
    expect($decoded)->not->toBeEmpty();
});

test('database query tool rejects insert query', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => "INSERT INTO users (name) VALUES ('test')"]));

    expect($result)->toContain('Only read-only queries are allowed');
});

test('database query tool rejects update query', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => "UPDATE users SET name = 'test'"]));

    expect($result)->toContain('Only read-only queries are allowed');
});

test('database query tool rejects delete query', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => 'DELETE FROM users']));

    expect($result)->toContain('Only read-only queries are allowed');
});

test('database query tool rejects drop query', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => 'DROP TABLE users']));

    expect($result)->toContain('Only read-only queries are allowed');
});

test('database query tool rejects empty query', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => '']));

    expect($result)->toContain('Please provide a valid SQL query');
});

test('database query tool returns error for invalid sql', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => 'SELECT FROM']));

    expect($result)->toContain('Query failed:');
});

test('database query tool can count users table', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => 'SELECT count(*) as total FROM users']));

    $decoded = json_decode($result, true);
    expect($decoded)->toBeArray();
    expect($decoded[0])->toHaveKey('total');
});

test('database query tool rejects CTE with delete', function () {
    $tool = new DatabaseQueryTool;

    $result = $tool->handle(new Request(['query' => 'WITH target AS (SELECT id FROM users) DELETE FROM users WHERE id IN (SELECT id FROM target)']));

    expect($result)->toContain('Only read-only queries are allowed');
});
