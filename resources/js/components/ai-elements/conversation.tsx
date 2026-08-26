import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import type { HTMLAttributes } from 'react';

function Conversation({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex-1 overflow-y-auto p-6', className)}
            {...props}
        />
    );
}

function ConversationContent({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('space-y-0', className)} {...props} />;
}

interface ConversationEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
}

function ConversationEmptyState({
    className,
    title = 'Start a conversation',
    description = 'Messages will appear here.',
    ...props
}: ConversationEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center',
                className,
            )}
            {...props}
        >
            <MessageSquare className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">{title}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export { Conversation, ConversationContent, ConversationEmptyState };
