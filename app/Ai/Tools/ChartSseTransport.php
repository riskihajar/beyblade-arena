<?php

namespace App\Ai\Tools;

use Prism\Relay\Exceptions\TransportException;
use Prism\Relay\Transport\HttpSseTransport;

/**
 * Custom SSE transport that handles both camelCase `sessionId`
 * and snake_case `session_id` query parameters.
 *
 * The MCP specification uses `sessionId` (camelCase), but Relay's
 * default HttpSseTransport only handles `session_id` (snake_case).
 */
class ChartSseTransport extends HttpSseTransport
{
    /**
     * Parse the endpoint data from the SSE event.
     * Handle both `session_id=` and `sessionId=` formats.
     */
    protected function parseEndpointData(string $data): void
    {
        $data = trim($data);

        // Support both camelCase (MCP spec) and snake_case (Relay default)
        if (str_contains($data, 'sessionId=')) {
            // Extract sessionId (camelCase - MCP spec format)
            if (! preg_match('/sessionId=([^&\s]+)/', $data, $matches)) {
                throw new TransportException(
                    "No sessionId found in endpoint data: {$data}"
                );
            }

            $this->sessionId = $matches[1];

            // Build the full message endpoint URL
            $baseUrl = $this->getBaseUrl();
            $path = parse_url($data, PHP_URL_PATH);
            $this->messageEndpoint = rtrim($baseUrl, '/').$path.'?sessionId='.$this->sessionId;

            return;
        }

        // Fall back to parent (snake_case session_id)
        parent::parseEndpointData($data);
    }
}
