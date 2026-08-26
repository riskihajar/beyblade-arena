<?php

namespace App\Ai\Tools;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Prism\Relay\Exceptions\ServerConfigurationException;
use Prism\Relay\Relay;

/**
 * Extended Relay that:
 * 1. Uses ChartSseTransport to handle MCP spec sessionId format
 * 2. Saves chart images to storage instead of returning "[Image data available]"
 */
class ChartRelay extends Relay
{
    /**
     * Override transport initialization to use our custom SSE transport
     * that handles both `sessionId` (MCP spec) and `session_id` (Relay default).
     *
     * @throws ServerConfigurationException
     */
    protected function initializeTransport(): void
    {
        $this->transport = new ChartSseTransport($this->serverConfig);
    }

    /**
     * Override formatContentResponse to save image data and return markdown image reference.
     */
    protected function formatContentResponse(array $response): string
    {
        $texts = [];
        $images = [];
        $isError = data_get($response, 'isError', false);
        $content = data_get($response, 'content', []);

        foreach ($content as $item) {
            $type = data_get($item, 'type');

            if ($type === 'text' && data_get($item, 'text')) {
                $texts[] = data_get($item, 'text');
            } elseif ($type === 'image' && data_get($item, 'data')) {
                $imageData = base64_decode(data_get($item, 'data'));
                $mimeType = data_get($item, 'mimeType', 'image/png');
                $extension = match ($mimeType) {
                    'image/png' => 'png',
                    'image/jpeg', 'image/jpg' => 'jpg',
                    'image/svg+xml' => 'svg',
                    'image/gif' => 'gif',
                    default => 'png',
                };

                $filename = 'charts/'.uniqid('chart_').'.'.$extension;

                try {
                    Storage::disk('public')->put($filename, $imageData);
                    $url = asset('storage/'.$filename);
                    $images[] = "![Chart]({$url})";
                } catch (\Throwable $e) {
                    Log::warning('Failed to save chart image: '.$e->getMessage());
                    $images[] = '[Chart image could not be saved]';
                }
            }
        }

        $prefix = $isError ? 'ERROR: ' : '';

        $parts = [];
        if ($texts !== []) {
            $parts[] = implode("\n", $texts);
        }
        if ($images !== []) {
            $parts[] = implode("\n", $images);
        }

        if ($parts !== []) {
            return $prefix.implode("\n\n", $parts);
        }

        return $prefix.'Chart generated successfully';
    }
}
