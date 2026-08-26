<?php

use Prism\Relay\Enums\Transport;

return [
    'servers' => [
        'chart' => [
            'url' => env('RELAY_CHART_SERVER_URL', 'http://localhost:1123/sse'),
            'timeout' => 30,
            'transport' => Transport::HttpSse,
        ],
    ],

    'cache_duration' => env('RELAY_TOOLS_CACHE_DURATION', 60),
];
