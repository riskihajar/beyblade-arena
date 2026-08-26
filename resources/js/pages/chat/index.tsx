import {
    Attachment,
    AttachmentInfo,
    AttachmentPreview,
    AttachmentRemove,
    Attachments,
} from '@/components/ai-elements/attachments';
import {
    Conversation,
    ConversationContent,
} from '@/components/ai-elements/conversation';
import {
    Message,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import TitleGenerator from '@/components/chat/title-generator';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Frame, FrameFooter, FramePanel } from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupTextarea,
} from '@/components/ui/input-group';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/components/ui/menu';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectGroupLabel,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toastManager } from '@/components/ui/toast';
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import chatRoutes from '@/routes/chat';
import { Form, Head, Link, router } from '@inertiajs/react';
import { useStream } from '@laravel/stream-react';
import {
    ArrowUp,
    Check,
    Globe,
    LoaderCircle,
    MessageCircle,
    Paperclip,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    attachments?: ChatAttachment[];
    created_at: string;
}

interface ChatConversation {
    id: string;
    title: string;
    updated_at: string;
    is_title_generated?: boolean;
    provider?: string | null;
    model?: string | null;
}

interface ChatAttachment {
    id: string;
    type: 'image' | 'document';
    name: string;
    mime_type: string;
    size: number;
    storage_driver: string;
    provider_file_id?: string | null;
    storage_path?: string | null;
    url?: string | null;
}

interface ChatModelItem {
    value: string;
    label: string;
    supports_web_search: boolean;
    supports_attachments: boolean;
    supports_images: boolean;
    supports_documents: boolean;
}

interface ChatModelGroup {
    provider: string;
    provider_label: string;
    models: ChatModelItem[];
}

interface StreamEvent {
    type?: string;
    delta?: string;
}

function getCookieValue(name: string): string | null {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${escapedName}=([^;]*)`),
    );

    return match ? decodeURIComponent(match[1]) : null;
}

function extractTextDeltasFromChunk(
    chunk: string,
    buffer: { current: string },
    hasTextRef?: { current: boolean },
): string[] {
    const deltas: string[] = [];

    buffer.current += chunk;

    const lines = buffer.current.split(/\r?\n/);
    buffer.current = lines.pop() ?? '';

    for (const line of lines) {
        const normalizedLine = line.trim();

        if (normalizedLine === '' || normalizedLine.startsWith('event:')) {
            continue;
        }

        const payload = normalizedLine.startsWith('data:')
            ? normalizedLine.slice(5).trim()
            : normalizedLine;

        if (!payload || payload === '[DONE]') {
            continue;
        }

        try {
            const event = JSON.parse(payload) as StreamEvent;

            if (event.type === 'text_start' && hasTextRef?.current) {
                // Insert separator between multi-step text outputs
                deltas.push('\n\n');
            }

            if (event.type === 'text_delta' && event.delta) {
                if (hasTextRef) {
                    hasTextRef.current = true;
                }
                deltas.push(event.delta);
            }
        } catch {
            continue;
        }
    }

    return deltas;
}

interface Props {
    active_chat: ChatConversation | null;
    messages: ChatMessage[];
    model_groups: ChatModelGroup[];
    default_model: string;
}

export default function ChatIndex({
    active_chat,
    messages,
    model_groups,
    default_model,
}: Props) {
    const [input, setInput] = useState('');
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages);
    const [activeChatTitle, setActiveChatTitle] = useState(
        active_chat?.title ?? 'New Chat',
    );
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(
        active_chat?.title ?? 'New Chat',
    );
    const [generatingTitleFor, setGeneratingTitleFor] = useState<string | null>(
        null,
    );
    const [streamingText, setStreamingText] = useState('');
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const [selectedModel, setSelectedModel] = useState(
        active_chat?.model ?? default_model,
    );
    const [deleteConversation, setDeleteConversation] =
        useState<ChatConversation | null>(null);
    const [pendingAttachments, setPendingAttachments] = useState<
        ChatAttachment[]
    >([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamBufferRef = useRef('');
    const lastDeltaTimeRef = useRef<number>(0);
    const hasStreamedTextRef = useRef(false);
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previousChatIdRef = useRef<string | null>(active_chat?.id ?? null);
    const modelLabels = useMemo(() => {
        return model_groups.reduce<Record<string, string>>((labels, group) => {
            for (const model of group.models) {
                labels[model.value] = model.label;
            }

            return labels;
        }, {});
    }, [model_groups]);

    const modelWebSearchSupport = useMemo(() => {
        return model_groups.reduce<Record<string, boolean>>(
            (support, group) => {
                for (const model of group.models) {
                    support[model.value] = model.supports_web_search;
                }

                return support;
            },
            {},
        );
    }, [model_groups]);

    const currentModelSupportsWebSearch = useMemo(() => {
        if (model_groups.length === 0) {
            return true;
        }

        return modelWebSearchSupport[selectedModel] ?? false;
    }, [model_groups.length, modelWebSearchSupport, selectedModel]);

    const modelAttachmentSupport = useMemo(() => {
        return model_groups.reduce<Record<string, boolean>>(
            (support, group) => {
                for (const model of group.models) {
                    support[model.value] = model.supports_attachments;
                }

                return support;
            },
            {},
        );
    }, [model_groups]);

    const currentModelSupportsAttachments = useMemo(() => {
        if (model_groups.length === 0) {
            return true;
        }

        return modelAttachmentSupport[selectedModel] ?? false;
    }, [model_groups.length, modelAttachmentSupport, selectedModel]);

    const handleFileUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file || !active_chat) return;

            const allowedImageMimes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            const allowedDocMimes = [
                'application/pdf',
                'text/plain',
                'text/markdown',
                'text/csv',
            ];
            const allowedMimes = [...allowedImageMimes, ...allowedDocMimes];

            if (!allowedMimes.includes(file.type)) {
                toastManager.add({
                    type: 'warning',
                    title: 'Unsupported file type',
                    description:
                        'Allowed: JPEG, PNG, GIF, WebP, PDF, TXT, MD, CSV.',
                });

                return;
            }

            if (file.size > 20 * 1024 * 1024) {
                toastManager.add({
                    type: 'warning',
                    title: 'File too large',
                    description: 'File size must be less than 20MB.',
                });

                return;
            }

            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('model', selectedModel);

                const xsrfToken = getCookieValue('XSRF-TOKEN');

                const response = await fetch(
                    chatRoutes.upload({ chat: active_chat.id }).url,
                    {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                        },
                    },
                );

                const contentType = response.headers.get('content-type') ?? '';
                let payload: {
                    attachment?: ChatAttachment;
                    error?: string;
                    message?: string;
                } | null = null;

                if (contentType.includes('application/json')) {
                    payload = await response.json();
                } else {
                    const bodyText = await response.text();

                    if (
                        response.status === 419 ||
                        bodyText.includes('Page Expired')
                    ) {
                        throw new Error(
                            'Session expired (419). Please refresh the page and try again.',
                        );
                    }

                    throw new Error(
                        `Upload failed with unexpected response (${response.status}).`,
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        payload?.error ||
                            payload?.message ||
                            `Upload failed (${response.status}).`,
                    );
                }

                if (!payload?.attachment) {
                    throw new Error(
                        'Upload failed. Missing attachment payload.',
                    );
                }

                const uploadedAttachment = payload.attachment;

                setPendingAttachments((prev) => [...prev, uploadedAttachment]);
            } catch (error) {
                console.error('Upload error:', error);
                toastManager.add({
                    type: 'error',
                    title: 'Upload failed',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Failed to upload file.',
                });
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        },
        [active_chat, selectedModel],
    );

    const removePendingAttachment = useCallback((id: string) => {
        setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const focusInput = useCallback(() => {
        window.requestAnimationFrame(() => {
            const inputElement = inputRef.current;

            if (!inputElement) {
                return;
            }

            inputElement.focus();

            const cursorPosition = inputElement.value.length;

            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        });
    }, []);

    const streamUrl = active_chat
        ? chatRoutes.stream({ chat: active_chat.id }).url
        : '';

    const { isFetching, isStreaming, send } = useStream(streamUrl, {
        csrfToken: '',
        onBeforeSend: (request) => {
            const xsrfToken = getCookieValue('XSRF-TOKEN');
            const headers = {
                ...(request.headers as Record<string, string> | undefined),
                Accept: 'text/event-stream',
                'X-Requested-With': 'XMLHttpRequest',
                ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
            };

            return {
                ...request,
                headers,
            };
        },
        onData: (chunk) => {
            const deltas = extractTextDeltasFromChunk(
                chunk,
                streamBufferRef,
                hasStreamedTextRef,
            );

            if (deltas.length > 0) {
                lastDeltaTimeRef.current = Date.now();
                setIsThinking(false);
                setStreamingText((previous) => previous + deltas.join(''));
            }
        },
        onFinish: () => {
            setIsThinking(false);
            lastDeltaTimeRef.current = 0;

            const remainingDeltas = extractTextDeltasFromChunk(
                '\n',
                streamBufferRef,
                hasStreamedTextRef,
            );

            if (remainingDeltas.length > 0) {
                setStreamingText(
                    (previous) => previous + remainingDeltas.join(''),
                );
            }

            streamBufferRef.current = '';
            hasStreamedTextRef.current = false;

            const userMessageCount = localMessages.filter(
                (message) => message.role === 'user',
            ).length;
            const shouldGenerateTitle =
                Boolean(active_chat?.id) &&
                !active_chat?.is_title_generated &&
                userMessageCount <= 1;

            router.reload({
                only: ['messages', 'conversations', 'auth', 'active_chat'],
                onSuccess: () => {
                    setStreamingText('');

                    if (shouldGenerateTitle && active_chat) {
                        setGeneratingTitleFor(active_chat.id);
                    }

                    focusInput();
                },
            });
        },
        onError: (err) => {
            setIsThinking(false);
            lastDeltaTimeRef.current = 0;
            streamBufferRef.current = '';
            hasStreamedTextRef.current = false;
            setStreamingText('');
            focusInput();
            console.error('Stream error:', err);

            const rawMessage = err instanceof Error ? err.message : '';
            const FALLBACK =
                'Something went wrong while generating the response. Please try again.';

            // The stream hook may pass the full JSON response body as err.message
            let parsedMessage = rawMessage;
            try {
                const parsed = JSON.parse(rawMessage);
                if (typeof parsed?.error === 'string') {
                    parsedMessage = parsed.error;
                } else if (typeof parsed?.message === 'string') {
                    parsedMessage = parsed.message;
                }
            } catch {
                // not JSON, use as-is
            }

            const MAX_ERROR_LENGTH = 200;
            const isSessionExpired =
                parsedMessage.includes('Page Expired') ||
                parsedMessage.includes('419');

            const description = isSessionExpired
                ? 'Session expired (419). Please refresh the page and try again.'
                : parsedMessage.length > MAX_ERROR_LENGTH || !parsedMessage
                  ? FALLBACK
                  : parsedMessage;

            toastManager.add({
                type: 'error',
                title: 'Chat error',
                description,
            });
        },
    });

    const scrollAnchor = `${localMessages.length}:${streamingText.length}`;

    const isProcessing = isFetching || isStreaming;

    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    useEffect(() => {
        const nextTitle = active_chat?.title ?? 'New Chat';

        setActiveChatTitle(nextTitle);
        setTitleDraft(nextTitle);
    }, [active_chat?.title]);

    useEffect(() => {
        setSelectedModel(active_chat?.model ?? default_model);
    }, [active_chat?.model, default_model]);

    useEffect(() => {
        const nextChatId = active_chat?.id ?? null;

        if (previousChatIdRef.current === nextChatId) {
            return;
        }

        previousChatIdRef.current = nextChatId;

        setStreamingText('');
        streamBufferRef.current = '';
        hasStreamedTextRef.current = false;
        setIsEditingTitle(false);
        setGeneratingTitleFor(null);
    }, [active_chat]);

    useEffect(() => {
        if (scrollAnchor) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [scrollAnchor]);

    useEffect(() => {
        if (!isProcessing) {
            setIsThinking(false);
            lastDeltaTimeRef.current = 0;
            return;
        }

        const interval = setInterval(() => {
            if (
                lastDeltaTimeRef.current > 0 &&
                Date.now() - lastDeltaTimeRef.current > 1500
            ) {
                setIsThinking(true);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isProcessing]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!input.trim() || isProcessing || !active_chat) return;

            const userMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                role: 'user',
                content: input,
                created_at: new Date().toISOString(),
            };

            setLocalMessages((prev) => [...prev, userMessage]);
            setInput('');
            setStreamingText('');
            streamBufferRef.current = '';
            lastDeltaTimeRef.current = 0;
            hasStreamedTextRef.current = false;
            setIsThinking(false);

            const attachmentsToSend = [...pendingAttachments];
            setPendingAttachments([]);

            send({
                message: input,
                conversation_id: active_chat.id,
                model: selectedModel,
                web_search: webSearchEnabled,
                attachments: attachmentsToSend,
            });
        },
        [
            input,
            active_chat,
            isProcessing,
            selectedModel,
            send,
            webSearchEnabled,
            pendingAttachments,
        ],
    );

    const handleNewChat = () => {
        router.post(
            chatRoutes.store(),
            {},
            {
                onSuccess: (page: { url: string }) => {
                    const match = page.url.match(/\/chat\/([^/]+)/);
                    const chatId = match ? match[1] : null;
                    if (chatId) {
                        router.visit(`/chat/${chatId}`);
                    }
                },
            },
        );
    };

    const handleModelChange = useCallback(
        (value: string) => {
            if (!active_chat || isProcessing) {
                return;
            }

            const previousModel = active_chat.model ?? default_model;

            setSelectedModel(value);

            if (!modelWebSearchSupport[value]) {
                setWebSearchEnabled(false);
            }

            router.patch(
                chatRoutes.updateModel({ chat: active_chat.id }),
                { model: value },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => {
                        setSelectedModel(previousModel);
                    },
                    onSuccess: () => {
                        router.reload({
                            only: ['active_chat', 'conversations', 'auth'],
                        });
                    },
                },
            );
        },
        [active_chat, default_model, isProcessing, modelWebSearchSupport],
    );

    const handleStartTitleEdit = () => {
        if (!active_chat) {
            return;
        }

        setTitleDraft(activeChatTitle);
        setIsEditingTitle(true);
    };

    const handleCancelTitleEdit = () => {
        setTitleDraft(activeChatTitle);
        setIsEditingTitle(false);
    };

    const handleTitleSaveSuccess = useCallback(() => {
        const nextTitle = titleDraft.trim();

        if (nextTitle) {
            setActiveChatTitle(nextTitle);
            setTitleDraft(nextTitle);
        }

        setGeneratingTitleFor(null);
        setIsEditingTitle(false);
        router.reload({ only: ['conversations', 'auth', 'active_chat'] });
    }, [titleDraft]);

    const handleTitleUpdate = useCallback((title: string) => {
        setActiveChatTitle(title);
        setTitleDraft(title);
    }, []);

    const handleTitleGenerationComplete = useCallback(() => {
        setGeneratingTitleFor(null);
        router.reload({ only: ['conversations', 'auth', 'active_chat'] });
    }, []);

    return (
        <>
            <Head title="Chat" />
            {active_chat && generatingTitleFor === active_chat.id && (
                <TitleGenerator
                    conversationId={active_chat.id}
                    onTitleUpdate={handleTitleUpdate}
                    onComplete={handleTitleGenerationComplete}
                />
            )}
            <AppLayout
                breadcrumbs={[{ title: 'Chat', href: chatRoutes.index().url }]}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    {!active_chat ? (
                                        <>
                                            <h1 className="text-2xl font-semibold">
                                                Chat
                                            </h1>
                                            <p className="text-muted-foreground">
                                                Continue your conversation with
                                                AI.
                                            </p>
                                        </>
                                    ) : isEditingTitle ? (
                                        <Form
                                            action={chatRoutes.update({
                                                chat: active_chat.id,
                                            })}
                                            method="patch"
                                            transform={() => ({
                                                title: titleDraft.trim(),
                                            })}
                                            onSuccess={handleTitleSaveSuccess}
                                            className="flex w-full max-w-xl items-center gap-2"
                                        >
                                            {({
                                                processing,
                                            }: {
                                                processing: boolean;
                                            }) => (
                                                <>
                                                    <Input
                                                        id="chat-title"
                                                        name="title"
                                                        value={titleDraft}
                                                        onChange={(e) =>
                                                            setTitleDraft(
                                                                e.target.value,
                                                            )
                                                        }
                                                        maxLength={80}
                                                        autoFocus
                                                        required
                                                    />
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={
                                                            processing ||
                                                            !titleDraft.trim()
                                                        }
                                                    >
                                                        <Check className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={
                                                            handleCancelTitleEdit
                                                        }
                                                        disabled={processing}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    ) : (
                                        <div className="flex min-w-0 items-center gap-2">
                                            <h1
                                                className={`truncate text-2xl font-semibold ${
                                                    generatingTitleFor ===
                                                    active_chat.id
                                                        ? 'animate-pulse'
                                                        : ''
                                                }`}
                                            >
                                                {activeChatTitle || 'New Chat'}
                                            </h1>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleStartTitleEdit}
                                                className="text-muted-foreground hover:text-foreground"
                                                title="Edit title"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {active_chat && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setDeleteConversation(active_chat)
                                        }
                                        className="mt-1 text-muted-foreground hover:text-destructive"
                                        title="Delete conversation"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>

                            {active_chat && (
                                <div>
                                    <Link
                                        href="/chat"
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        ← Back
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Frame className="w-full">
                            <FramePanel className="flex min-h-[calc(100vh-24rem)]">
                                {!active_chat ? (
                                    <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
                                        <MessageCircle className="mb-4 size-16" />
                                        <p className="text-lg font-medium">
                                            Welcome to Chat
                                        </p>
                                        <p className="mb-4 text-sm">
                                            Start a new conversation
                                        </p>
                                        <Button onClick={handleNewChat}>
                                            <Plus className="mr-2 size-4" />
                                            New Chat
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Conversation className="px-0 py-4">
                                            {localMessages.length === 0 &&
                                                !isProcessing && (
                                                    <Empty className="h-full">
                                                        <EmptyHeader>
                                                            <EmptyMedia variant="icon">
                                                                <MessageCircle className="size-4" />
                                                            </EmptyMedia>
                                                            <EmptyTitle>
                                                                Start a
                                                                conversation
                                                            </EmptyTitle>
                                                            <EmptyDescription>
                                                                Ask anything to
                                                                begin this chat.
                                                            </EmptyDescription>
                                                        </EmptyHeader>
                                                    </Empty>
                                                )}
                                            <ConversationContent>
                                                {localMessages.map((msg) => {
                                                    const messageAttachments =
                                                        msg.attachments ?? [];
                                                    const isUserMessage =
                                                        msg.role === 'user';

                                                    return (
                                                        <Message
                                                            key={msg.id}
                                                            from={msg.role}
                                                        >
                                                            {messageAttachments.length >
                                                                0 && (
                                                                <Attachments
                                                                    variant="gallery"
                                                                    className={cn(
                                                                        'w-fit max-w-md',
                                                                        isUserMessage
                                                                            ? 'self-end'
                                                                            : 'self-start',
                                                                    )}
                                                                >
                                                                    {messageAttachments.map(
                                                                        (
                                                                            attachment,
                                                                        ) => (
                                                                            <Attachment
                                                                                key={
                                                                                    attachment.id
                                                                                }
                                                                                data={
                                                                                    attachment
                                                                                }
                                                                            >
                                                                                <AttachmentPreview />
                                                                            </Attachment>
                                                                        ),
                                                                    )}
                                                                </Attachments>
                                                            )}
                                                            <MessageContent>
                                                                {msg.role ===
                                                                'assistant' ? (
                                                                    <MessageResponse
                                                                        markdown
                                                                    >
                                                                        {
                                                                            msg.content
                                                                        }
                                                                    </MessageResponse>
                                                                ) : (
                                                                    <MessageResponse
                                                                        markdown={
                                                                            false
                                                                        }
                                                                    >
                                                                        {
                                                                            msg.content
                                                                        }
                                                                    </MessageResponse>
                                                                )}
                                                            </MessageContent>
                                                        </Message>
                                                    );
                                                })}

                                                {streamingText && (
                                                    <Message from="assistant">
                                                        <MessageContent>
                                                            <MessageResponse
                                                                markdown
                                                                isAnimating={
                                                                    isProcessing
                                                                }
                                                            >
                                                                {streamingText}
                                                            </MessageResponse>
                                                            {isThinking && (
                                                                <div className="mt-3 inline-flex items-center gap-2 text-muted-foreground">
                                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                                    <span>
                                                                        Thinking...
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </MessageContent>
                                                    </Message>
                                                )}

                                                {isProcessing &&
                                                    !streamingText && (
                                                        <Message from="assistant">
                                                            <MessageContent className="inline-flex items-center gap-2">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                                <span>
                                                                    Thinking...
                                                                </span>
                                                            </MessageContent>
                                                        </Message>
                                                    )}

                                                <div ref={messagesEndRef} />
                                            </ConversationContent>
                                        </Conversation>
                                    </>
                                )}
                            </FramePanel>
                            {active_chat && (
                                <FrameFooter className="p-3">
                                    <form
                                        ref={formRef}
                                        onSubmit={handleSubmit}
                                        className="w-full"
                                    >
                                        <InputGroup className="border bg-background shadow-xs transition-shadow **:[textarea]:max-h-48 **:[textarea]:min-h-10 **:[textarea]:overflow-x-hidden **:[textarea]:overflow-y-auto">
                                            {pendingAttachments.length > 0 && (
                                                <Attachments
                                                    variant="inline"
                                                    className="border-b px-3 py-2"
                                                >
                                                    {pendingAttachments.map(
                                                        (attachment) => (
                                                            <Attachment
                                                                key={
                                                                    attachment.id
                                                                }
                                                                data={
                                                                    attachment
                                                                }
                                                                onRemove={() =>
                                                                    removePendingAttachment(
                                                                        attachment.id,
                                                                    )
                                                                }
                                                            >
                                                                <AttachmentPreview />
                                                                <AttachmentInfo />
                                                                <AttachmentRemove />
                                                            </Attachment>
                                                        ),
                                                    )}
                                                </Attachments>
                                            )}

                                            <InputGroupTextarea
                                                ref={inputRef}
                                                value={input}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                                ) => setInput(e.target.value)}
                                                onKeyDown={(
                                                    event: React.KeyboardEvent<HTMLTextAreaElement>,
                                                ) => {
                                                    if (
                                                        event.key === 'Enter' &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();
                                                        formRef.current?.requestSubmit();
                                                    }
                                                }}
                                                placeholder="Ask, Search or Chat…"
                                                disabled={isProcessing}
                                                rows={1}
                                                className="max-h-48 min-h-10 resize-none border-0 px-3 pt-3 pb-1 shadow-none focus-visible:ring-0"
                                            />

                                            <InputGroupAddon
                                                align="block-end"
                                                className="flex items-center justify-between gap-2 px-3 pt-0 pb-2.5"
                                            >
                                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                                    <Menu>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                render={
                                                                    <MenuTrigger
                                                                        render={
                                                                            <Button
                                                                                type="button"
                                                                                aria-label="Add tools and files"
                                                                                size="icon-sm"
                                                                                variant="ghost"
                                                                                disabled={
                                                                                    isProcessing
                                                                                }
                                                                            />
                                                                        }
                                                                    >
                                                                        <Plus className="size-4" />
                                                                    </MenuTrigger>
                                                                }
                                                            />
                                                            <TooltipPopup>
                                                                Add files and
                                                                more
                                                            </TooltipPopup>
                                                        </Tooltip>
                                                        <MenuPopup align="start" className="min-w-48">
                                                            <MenuItem
                                                                onClick={() =>
                                                                    fileInputRef.current?.click()
                                                                }
                                                                disabled={
                                                                    !currentModelSupportsAttachments ||
                                                                    isUploading ||
                                                                    isProcessing
                                                                }
                                                            >
                                                                <Paperclip className="mr-2 size-4" />
                                                                <span>
                                                                    {isUploading
                                                                        ? 'Uploading...'
                                                                        : 'Add photos & files'}
                                                                </span>
                                                                {!currentModelSupportsAttachments && (
                                                                    <span className="ml-auto text-[10px] text-muted-foreground">
                                                                        (Not supported)
                                                                    </span>
                                                                )}
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() =>
                                                                    setWebSearchEnabled(
                                                                        (
                                                                            val,
                                                                        ) =>
                                                                            !val,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !currentModelSupportsWebSearch
                                                                }
                                                            >
                                                                <Globe className="mr-2 size-4" />
                                                                <span>
                                                                    {webSearchEnabled
                                                                        ? 'Web search (Active)'
                                                                        : 'Web search'}
                                                                </span>
                                                                {!currentModelSupportsWebSearch && (
                                                                    <span className="ml-auto text-[10px] text-muted-foreground">
                                                                        (Not supported)
                                                                    </span>
                                                                )}
                                                            </MenuItem>
                                                        </MenuPopup>
                                                    </Menu>

                                                    {/* Hidden file input */}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/markdown,text/csv"
                                                        onChange={
                                                            handleFileUpload
                                                        }
                                                        className="hidden"
                                                        disabled={
                                                            isUploading ||
                                                            isProcessing
                                                        }
                                                    />

                                                    {/* Web search active badge */}
                                                    {webSearchEnabled && (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                            <Globe className="size-3" />
                                                            Search active
                                                        </span>
                                                    )}

                                                    {/* Model Selector */}
                                                    <Select
                                                        value={selectedModel}
                                                        onValueChange={(
                                                            value: unknown,
                                                        ) =>
                                                            handleModelChange(
                                                                (value as string) ??
                                                                    '',
                                                            )
                                                        }
                                                        itemToStringLabel={(
                                                            value: unknown,
                                                        ) =>
                                                            modelLabels[
                                                                (value as string) ??
                                                                    ''
                                                            ] ||
                                                            ((value as string) ??
                                                                '')
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            size="sm"
                                                            className="h-7 w-auto max-w-48 min-w-0 shrink-0 border-muted bg-muted/40 text-xs font-medium hover:bg-muted"
                                                        >
                                                            <SelectValue
                                                                placeholder={
                                                                    modelLabels[
                                                                        default_model
                                                                    ] ||
                                                                    default_model
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent className="min-w-64">
                                                            {model_groups.length === 0 ? (
                                                                <div className="flex flex-col gap-1 p-3 text-center">
                                                                    <p className="text-xs font-semibold text-foreground">
                                                                        No Provider Configured
                                                                    </p>
                                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                                        Using default model ({modelLabels[selectedModel] || selectedModel || default_model}) and provider.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                model_groups.map(
                                                                    (group) => (
                                                                        <SelectGroup
                                                                            key={
                                                                                group.provider
                                                                            }
                                                                        >
                                                                            <SelectGroupLabel>
                                                                                {
                                                                                    group.provider_label
                                                                                }
                                                                            </SelectGroupLabel>
                                                                            {group.models.map(
                                                                                (
                                                                                    model,
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            model.value
                                                                                        }
                                                                                        value={
                                                                                            model.value
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            model.label
                                                                                        }
                                                                                    </SelectItem>
                                                                                ),
                                                                            )}
                                                                        </SelectGroup>
                                                                    ),
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Submit button on right */}
                                                <div className="ml-auto flex shrink-0 items-center gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            render={
                                                                <Button
                                                                    type="submit"
                                                                    aria-label="Send"
                                                                    size="icon-sm"
                                                                    variant="default"
                                                                    disabled={
                                                                        !input.trim() ||
                                                                        isProcessing
                                                                    }
                                                                >
                                                                    {isProcessing ? (
                                                                        <LoaderCircle className="size-4 animate-spin" />
                                                                    ) : (
                                                                        <ArrowUp className="size-4" />
                                                                    )}
                                                                </Button>
                                                            }
                                                        />
                                                        <TooltipPopup>
                                                            {isProcessing
                                                                ? 'Thinking...'
                                                                : 'Send message'}
                                                        </TooltipPopup>
                                                    </Tooltip>
                                                </div>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </form>
                                </FrameFooter>
                            )}
                        </Frame>
                    </div>
                </div>
            </AppLayout>

            <Dialog
                open={!!deleteConversation}
                onOpenChange={() => setDeleteConversation(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete conversation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-medium text-foreground">
                                {deleteConversation?.title ||
                                    'this conversation'}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        {deleteConversation && (
                            <Form
                                action={chatRoutes.destroy({
                                    chat: deleteConversation.id,
                                })}
                                method="delete"
                                onSuccess={() => setDeleteConversation(null)}
                            >
                                {({ processing }: { processing: boolean }) => (
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </Form>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
