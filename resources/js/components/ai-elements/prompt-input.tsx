import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoaderCircle, Send } from 'lucide-react';
import type {
    ButtonHTMLAttributes,
    ComponentProps,
    FormHTMLAttributes,
    HTMLAttributes,
} from 'react';
import { forwardRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export interface PromptInputMessage {
    text: string;
}

type PromptInputStatus = 'ready' | 'submitted' | 'streaming' | 'error';

const PromptInputForm = forwardRef<
    HTMLFormElement,
    FormHTMLAttributes<HTMLFormElement>
>(function PromptInputForm({ className, ...props }, ref) {
    return (
        <form
            ref={ref}
            className={cn('rounded-xl border bg-background p-2', className)}
            {...props}
        />
    );
});

function PromptInputBody({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('px-1', className)} {...props} />;
}

const PromptInputTextarea = forwardRef<
    HTMLTextAreaElement,
    ComponentProps<typeof TextareaAutosize>
>(function PromptInputTextarea({ className, ...props }, ref) {
    return (
        <TextareaAutosize
            ref={ref}
            className={cn(
                'min-h-10 w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
});

function PromptInputFooter({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-2 pt-1',
                className,
            )}
            {...props}
        />
    );
}

function PromptInputTools({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center gap-1', className)} {...props} />
    );
}

function PromptInputButton({
    className,
    type = 'button',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            type={type}
            variant="ghost"
            size="sm"
            className={cn('h-8 rounded-md px-2 text-xs', className)}
            {...props}
        />
    );
}

interface PromptInputSubmitProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type'
> {
    status?: PromptInputStatus;
}

function PromptInputSubmit({
    className,
    status = 'ready',
    disabled,
    ...props
}: PromptInputSubmitProps) {
    return (
        <Button
            type="submit"
            size="icon"
            className={cn('size-8 rounded-md', className)}
            disabled={
                disabled || status === 'submitted' || status === 'streaming'
            }
            {...props}
        >
            {status === 'submitted' || status === 'streaming' ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : (
                <Send className="size-4" />
            )}
        </Button>
    );
}

export {
    PromptInputForm as PromptInput,
    PromptInputBody,
    PromptInputButton,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputTools,
};
