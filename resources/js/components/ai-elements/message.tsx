import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';
import { Streamdown } from 'streamdown';

type MessageFrom = 'user' | 'assistant' | 'system';

interface MessageProps extends HTMLAttributes<HTMLDivElement> {
    from: MessageFrom;
}

function Message({ from, className, ...props }: MessageProps) {
    return (
        <div
            className={cn(
                'group mb-4 flex w-full flex-col gap-2',
                from === 'user' ? 'is-user items-end' : 'items-start',
                className,
            )}
            data-from={from}
            {...props}
        />
    );
}

function MessageContent({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                'bg-muted text-foreground',
                'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground',
                className,
            )}
            {...props}
        />
    );
}

interface MessageResponseProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children'
> {
    children?: ReactNode;
    markdown?: boolean;
    isAnimating?: boolean;
}

function MessageResponse({
    className,
    children,
    markdown = true,
    isAnimating = false,
    ...props
}: MessageResponseProps) {
    if (!markdown || typeof children !== 'string') {
        return (
            <div
                className={cn('leading-relaxed whitespace-pre-wrap', className)}
                {...props}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'leading-relaxed [&_.sd-markdown_ol]:ml-5 [&_.sd-markdown_ol]:list-decimal [&_.sd-markdown_p]:whitespace-pre-wrap [&_.sd-markdown_ul]:ml-5 [&_.sd-markdown_ul]:list-disc',
                className,
            )}
            {...props}
        >
            <Streamdown isAnimating={isAnimating}>{children}</Streamdown>
        </div>
    );
}

export { Message, MessageContent, MessageResponse };
