import chatRoutes from '@/routes/chat';
import { useEventStream } from '@laravel/stream-react';

interface TitleGeneratorProps {
    conversationId: string;
    onTitleUpdate: (title: string) => void;
    onComplete: () => void;
}

export default function TitleGenerator({
    conversationId,
    onTitleUpdate,
    onComplete,
}: TitleGeneratorProps) {
    useEventStream(chatRoutes.titleStream({ chat: conversationId }).url, {
        eventName: 'title-update',
        endSignal: '</stream>',
        onMessage: (event) => {
            try {
                const payload = JSON.parse(event.data) as { title?: string };

                if (payload.title) {
                    onTitleUpdate(payload.title);
                }
            } catch {
                return;
            }
        },
        onComplete,
        onError: () => {
            onComplete();
        },
    });

    return null;
}
