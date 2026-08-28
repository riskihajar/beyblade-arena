import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

interface Options {
    eventId?: string;
    categoryId?: string;
    pollingIntervalMs?: number;
    enabled?: boolean;
}

export function useTournamentRealtime({
    eventId,
    categoryId,
    pollingIntervalMs = 10000,
    enabled = true,
}: Options) {
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (!enabled || !eventId) return;

        let echoChannelCalls: any = null;
        let echoChannelScores: any = null;
        let echoChannelBracket: any = null;

        const win = window as any;
        if (win.Echo) {
            try {
                echoChannelCalls = win.Echo.channel(
                    `tournament.${eventId}.calls`,
                ).listen('.match.called', () => {
                    router.reload();
                });

                echoChannelScores = win.Echo.channel(
                    `tournament.${eventId}.scores`,
                ).listen('.battle.recorded', () => {
                    router.reload();
                });

                if (categoryId) {
                    echoChannelBracket = win.Echo.channel(
                        `category.${categoryId}.bracket`,
                    ).listen('.bracket.updated', () => {
                        router.reload();
                    });
                }
            } catch (e) {
                console.warn('Echo setup fallback to polling:', e);
            }
        }

        // Graceful Polling Fallback
        timerRef.current = setInterval(() => {
            router.reload();
        }, pollingIntervalMs);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (win.Echo) {
                if (echoChannelCalls)
                    win.Echo.leave(`tournament.${eventId}.calls`);
                if (echoChannelScores)
                    win.Echo.leave(`tournament.${eventId}.scores`);
                if (echoChannelBracket && categoryId)
                    win.Echo.leave(`category.${categoryId}.bracket`);
            }
        };
    }, [eventId, categoryId, enabled, pollingIntervalMs]);
}
