<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Schema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class DatabaseSchemaTool implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Get the database schema including table names and their column names with types. Use this tool FIRST to understand the database structure before writing SQL queries with the database-query tool. You can optionally filter by table name.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        try {
            $filter = trim((string) ($request['filter'] ?? ''));
            $connectionName = config('database.default');
            $tables = Schema::connection($connectionName)->getTables();
            $result = [];

            foreach ($tables as $table) {
                $tableName = is_object($table) ? $table->name : ($table['name'] ?? '');

                if ($filter !== '' && ! str_contains(strtolower($tableName), strtolower($filter))) {
                    continue;
                }

                $columns = Schema::connection($connectionName)->getColumns($tableName);

                $result[$tableName] = collect($columns)
                    ->pluck('type', 'name')
                    ->all();
            }

            return json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) ?: '{}';
        } catch (Throwable $e) {
            return 'Schema retrieval failed: '.$e->getMessage();
        }
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'filter' => $schema->string()
                ->description('Optional filter to match table names by substring (case-insensitive). Leave empty to get all tables.'),
        ];
    }
}
