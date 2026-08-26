<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class DatabaseQueryTool implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Execute a read-only SQL query against the application database. Only SELECT, SHOW, EXPLAIN, and DESCRIBE queries are allowed. Use the database-schema tool first to understand the table structure before writing queries.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $query = trim((string) ($request['query'] ?? ''));
        $token = strtok(ltrim($query), " \t\n\r");

        if (! $token) {
            return 'Error: Please provide a valid SQL query.';
        }

        $firstWord = strtoupper($token);

        $allowList = [
            'SELECT',
            'SHOW',
            'EXPLAIN',
            'DESCRIBE',
            'DESC',
            'WITH',
            'VALUES',
            'TABLE',
        ];

        $isReadOnly = in_array($firstWord, $allowList, true);

        if ($firstWord === 'WITH') {
            if (! preg_match('/\)\s*SELECT\b/i', $query)) {
                $isReadOnly = false;
            }

            if (preg_match('/\)\s*(DELETE|UPDATE|INSERT|DROP|ALTER|TRUNCATE|REPLACE|RENAME|CREATE)\b/i', $query)) {
                $isReadOnly = false;
            }
        }

        if (! $isReadOnly) {
            return 'Error: Only read-only queries are allowed (SELECT, SHOW, EXPLAIN, DESCRIBE).';
        }

        try {
            $connection = DB::connection();
            $prefix = $connection->getTablePrefix();

            if ($prefix) {
                $query = $this->addPrefixToQuery($query, $prefix);
            }

            $results = $connection->select($query);

            return json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) ?: '[]';
        } catch (Throwable $e) {
            return 'Query failed: '.$e->getMessage();
        }
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('The read-only SQL query to execute (SELECT, SHOW, EXPLAIN, DESCRIBE only).')
                ->required(),
        ];
    }

    protected function addPrefixToQuery(string $query, string $prefix): string
    {
        $cteNames = $this->extractCteNames($query);

        $pattern = '/\b(FROM|JOIN|INTO|UPDATE|TABLE|DESCRIBE|DESC)\s+([`"\']?)(\w+)\2/i';

        return preg_replace_callback($pattern, function (array $matches) use ($prefix, $cteNames): string {
            $keyword = $matches[1];
            $quote = $matches[2];
            $tableName = $matches[3];

            if (str_starts_with($tableName, $prefix) || in_array($tableName, $cteNames, true)) {
                return $matches[0];
            }

            return "{$keyword} {$quote}{$prefix}{$tableName}{$quote}";
        }, $query) ?? $query;
    }

    /**
     * @return array<int, string>
     */
    protected function extractCteNames(string $query): array
    {
        if (preg_match_all('/\b(\w+)\s*(?:\([^)]*\))?\s*AS\s*\(/i', $query, $matches)) {
            return $matches[1];
        }

        return [];
    }
}
