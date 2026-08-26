import { ImagePreviewDialog } from '@/components/chat/image-preview-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Paperclip, X } from 'lucide-react';
import {
    createContext,
    useContext,
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
} from 'react';

type AttachmentVariant = 'grid' | 'inline' | 'list' | 'gallery';

interface AttachmentData {
    id: string;
    type?: string;
    name?: string | null;
    filename?: string | null;
    mime_type?: string | null;
    mediaType?: string | null;
    url?: string | null;
}

interface AttachmentsProps extends HTMLAttributes<HTMLDivElement> {
    variant?: AttachmentVariant;
}

interface AttachmentProps extends HTMLAttributes<HTMLDivElement> {
    data: AttachmentData;
    onRemove?: () => void;
}

interface AttachmentContextValue {
    data: AttachmentData;
    variant: AttachmentVariant;
    onRemove?: () => void;
}

const AttachmentVariantContext = createContext<AttachmentVariant>('grid');
const AttachmentContext = createContext<AttachmentContextValue | null>(null);

function getMediaCategory(
    data: AttachmentData,
): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
    if (data.type === 'image' || data.mime_type?.startsWith('image/')) {
        return 'image';
    }

    if (data.mime_type?.startsWith('video/')) {
        return 'video';
    }

    if (data.mime_type?.startsWith('audio/')) {
        return 'audio';
    }

    if (data.type === 'document' || data.mime_type) {
        return 'document';
    }

    return 'unknown';
}

function getAttachmentLabel(data: AttachmentData): string {
    return data.name ?? data.filename ?? 'Attachment';
}

function Attachments({
    className,
    variant = 'grid',
    ...props
}: AttachmentsProps) {
    return (
        <AttachmentVariantContext.Provider value={variant}>
            <div
                className={cn(
                    variant === 'grid' && 'grid grid-cols-2 gap-2',
                    variant === 'gallery' && 'flex w-fit flex-wrap gap-2',
                    variant === 'inline' && 'flex flex-wrap items-center gap-2',
                    variant === 'list' && 'flex flex-col gap-2',
                    className,
                )}
                {...props}
            />
        </AttachmentVariantContext.Provider>
    );
}

function Attachment({
    data,
    onRemove,
    className,
    children,
    ...props
}: AttachmentProps) {
    const variant = useContext(AttachmentVariantContext);

    return (
        <AttachmentContext.Provider value={{ data, variant, onRemove }}>
            <div
                className={cn(
                    'group/attachment',
                    variant === 'grid' &&
                        'relative overflow-hidden rounded-xl border border-border/70 bg-muted/20',
                    variant === 'gallery' &&
                        'relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/20',
                    variant === 'inline' &&
                        'inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs',
                    variant === 'list' &&
                        'flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm',
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        </AttachmentContext.Provider>
    );
}

function AttachmentPreview({
    className,
    fallbackIcon,
    ...props
}: HTMLAttributes<HTMLDivElement> & { fallbackIcon?: ReactNode }) {
    const context = useContext(AttachmentContext);

    if (!context) {
        return null;
    }

    const { data, variant } = context;
    const category = getMediaCategory(data);
    const label = getAttachmentLabel(data);

    if (category === 'image' && data.url) {
        return (
            <div className={className} {...props}>
                <ImagePreviewDialog
                    src={data.url}
                    alt={label}
                    trigger={
                        <Button
                            variant="ghost"
                            className={cn(
                                '!h-auto !min-h-0 !w-auto !min-w-0 rounded-md border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
                                variant === 'grid' && 'w-full',
                                variant === 'gallery' &&
                                    '!size-full rounded-none',
                                variant !== 'grid' && 'shrink-0',
                            )}
                        >
                            <img
                                src={data.url}
                                alt={label}
                                className={cn(
                                    'block',
                                    variant === 'grid' &&
                                        'aspect-square w-full cursor-zoom-in rounded-md object-cover transition-transform duration-200 group-hover/attachment:scale-[1.02]',
                                    variant === 'gallery' &&
                                        'size-full cursor-zoom-in object-cover transition-transform duration-200 group-hover/attachment:scale-[1.02]',
                                    variant === 'inline' &&
                                        'size-6 cursor-zoom-in rounded object-cover',
                                    variant === 'list' &&
                                        'size-10 cursor-zoom-in rounded-md object-cover',
                                )}
                            />
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                variant === 'grid' &&
                    'flex aspect-square w-full flex-col items-center justify-center gap-2 p-3 text-muted-foreground',
                variant === 'gallery' &&
                    'flex size-full flex-col items-center justify-center gap-2 p-2 text-muted-foreground',
                variant !== 'grid' && 'flex items-center text-muted-foreground',
                className,
            )}
            {...props}
        >
            {fallbackIcon ??
                (variant === 'grid' ? (
                    <FileText className="size-7" />
                ) : (
                    <Paperclip className="size-3.5" />
                ))}
            {(variant === 'grid' || variant === 'gallery') && (
                <span className="line-clamp-2 text-center text-xs font-medium text-foreground">
                    {label}
                </span>
            )}
        </div>
    );
}

function AttachmentInfo({
    className,
    showMediaType = false,
    ...props
}: HTMLAttributes<HTMLDivElement> & { showMediaType?: boolean }) {
    const context = useContext(AttachmentContext);

    if (
        !context ||
        context.variant === 'grid' ||
        context.variant === 'gallery'
    ) {
        return null;
    }

    const { data, variant } = context;
    const label = getAttachmentLabel(data);

    return (
        <div
            className={cn(
                'min-w-0',
                variant === 'inline' && 'max-w-24',
                variant === 'list' && 'flex-1',
                className,
            )}
            {...props}
        >
            <p className="truncate text-xs font-medium text-foreground">
                {label}
            </p>
            {showMediaType && data.mime_type && variant !== 'inline' && (
                <p className="truncate text-xs text-muted-foreground">
                    {data.mime_type}
                </p>
            )}
        </div>
    );
}

function AttachmentRemove({
    className,
    label = 'Remove',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
    const context = useContext(AttachmentContext);

    if (!context?.onRemove) {
        return null;
    }

    const { onRemove, variant } = context;

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            onClick={onRemove}
            className={cn(
                'inline-flex items-center justify-center rounded-md text-muted-foreground shadow-none transition-colors hover:text-foreground',
                (variant === 'grid' || variant === 'gallery') &&
                    'absolute top-1.5 right-1.5 z-10 size-6 rounded-full bg-black/60 p-0 text-white opacity-0 group-hover/attachment:opacity-100 hover:bg-black/75',
                variant !== 'grid' && 'size-4 p-0',
                className,
            )}
            {...props}
        >
            <X className="size-3" />
        </Button>
    );
}

export {
    Attachment,
    AttachmentInfo,
    AttachmentPreview,
    AttachmentRemove,
    Attachments,
    getAttachmentLabel,
    getMediaCategory,
};
