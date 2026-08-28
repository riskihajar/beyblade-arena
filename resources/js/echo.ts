import { configureEcho } from '@laravel/echo-react';

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;

export const echo = configureEcho(
    reverbKey
        ? {
              broadcaster: 'reverb',
              key: reverbKey,
              wsHost:
                  import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
              wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
              wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
              forceTLS:
                  (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
              enabledTransports: ['ws', 'wss'],
          }
        : {
              broadcaster: 'null',
          },
);

