import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as eventsIndex } from '@/routes/admin/events';
import { index as rulesetsIndex } from '@/routes/admin/rulesets';
import { index as seasonsIndex } from '@/routes/admin/seasons';
import chatRoutes from '@/routes/chat';
import settings from '@/routes/settings';
import { type Auth, type ChatConversation } from '@/types';
import { Form, Link, router, usePage } from '@inertiajs/react';
import {
    Bot,
    Calendar,
    Layers,
    LayoutGrid,
    LoaderCircle,
    MessageCircle,
    MoreHorizontal,
    Plus,
    ScrollText,
    Shield,
    Trash2,
    Trophy,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AppLogo from './app-logo';

interface ChatConversationsMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

interface ChatConversationsResponse {
    data: ChatConversation[];
    meta: ChatConversationsMeta;
}

const conversationsPerPage = 10;

function formatUpdatedAt(value: string): string {
    const normalizedValue = value.includes('T')
        ? value
        : value.replace(' ', 'T');
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const hasAdminAccess = auth.permissions?.includes('admin.access');
    const canManageTournaments =
        hasAdminAccess ||
        auth.permissions?.includes('tournament.view') ||
        auth.permissions?.includes('tournament.create');
    const chats = auth.chats || [];
    const chatsTotal = auth.chats_total ?? chats.length;
    const hasMoreChats = chatsTotal > chats.length;
    const page = usePage();
    const [isConversationsOpen, setIsConversationsOpen] = useState(false);
    const [isConversationsLoading, setIsConversationsLoading] = useState(false);
    const [conversationsError, setConversationsError] = useState<string | null>(
        null,
    );
    const [conversationsPage, setConversationsPage] = useState(1);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [conversationsMeta, setConversationsMeta] =
        useState<ChatConversationsMeta>({
            current_page: 1,
            from: null,
            last_page: 1,
            per_page: conversationsPerPage,
            to: null,
            total: 0,
        });
    const [deleteConversation, setDeleteConversation] =
        useState<ChatConversation | null>(null);

    const isActive = (href: string) => page.url === href;

    const fetchConversationsPage = useCallback(async (pageNumber: number) => {
        setIsConversationsLoading(true);
        setConversationsError(null);

        try {
            const url = chatRoutes.conversations.url({
                query: {
                    page: pageNumber,
                    per_page: conversationsPerPage,
                },
            });

            const response = await fetch(url, {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to load conversations: ${response.status}`,
                );
            }

            const payload =
                (await response.json()) as ChatConversationsResponse;

            setConversations(payload.data);
            setConversationsMeta(payload.meta);
        } catch (error) {
            console.error('Failed to load conversations modal data:', error);
            setConversationsError('Unable to load conversations right now.');
        } finally {
            setIsConversationsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isConversationsOpen) {
            return;
        }

        void fetchConversationsPage(conversationsPage);
    }, [fetchConversationsPage, isConversationsOpen, conversationsPage]);

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

    const handleOpenConversations = () => {
        setConversationsPage(1);
        setIsConversationsOpen(true);
    };

    const handleOpenConversation = (chatId: string) => {
        setIsConversationsOpen(false);
        router.visit(chatRoutes.show({ chat: chatId }).url);
    };

    const handlePreviousPage = () => {
        setConversationsPage((previousPage) => Math.max(previousPage - 1, 1));
    };

    const handleNextPage = () => {
        setConversationsPage((previousPage) =>
            Math.min(previousPage + 1, conversationsMeta.last_page),
        );
    };

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                render={
                                    <Link href={dashboard()} prefetch>
                                        <AppLogo />
                                    </Link>
                                }
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive(dashboard().url)}
                                    tooltip={{ children: 'Dashboard' }}
                                    render={
                                        <Link href={dashboard()} prefetch>
                                            <LayoutGrid className="size-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    {canManageTournaments && (
                        <SidebarGroup className="px-2 py-0">
                            <SidebarGroupLabel>Turnamen</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isActive('/admin/events')}
                                        tooltip={{ children: 'Turnamen & Event' }}
                                        render={
                                            <Link href={eventsIndex().url} prefetch>
                                                <Trophy className="size-4" />
                                                <span>Turnamen & Event</span>
                                            </Link>
                                        }
                                    />
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isActive('/admin/rulesets')}
                                        tooltip={{ children: 'Ruleset Scoring' }}
                                        render={
                                            <Link href={rulesetsIndex().url} prefetch>
                                                <Layers className="size-4" />
                                                <span>Ruleset Scoring</span>
                                            </Link>
                                        }
                                    />
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isActive('/admin/seasons')}
                                        tooltip={{ children: 'Musim Kompetisi' }}
                                        render={
                                            <Link href={seasonsIndex().url} prefetch>
                                                <Calendar className="size-4" />
                                                <span>Musim Kompetisi</span>
                                            </Link>
                                        }
                                    />
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    )}

                    <SidebarGroup>
                        <SidebarGroupLabel className="flex items-center justify-between px-2">
                            <span>Chats</span>
                            <button
                                type="button"
                                onClick={handleNewChat}
                                className="rounded p-1 hover:bg-muted"
                                title="New Chat"
                            >
                                <Plus className="size-3" />
                            </button>
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {chats.map((chat: ChatConversation) => (
                                    <SidebarMenuItem key={chat.id}>
                                        <SidebarMenuButton
                                            isActive={isActive(
                                                `/chat/${chat.id}`,
                                            )}
                                            tooltip={{
                                                children:
                                                    chat.title || 'New Chat',
                                            }}
                                            render={
                                                <Link href={`/chat/${chat.id}`}>
                                                    <MessageCircle className="size-4" />
                                                    <span className="truncate">
                                                        {chat.title ||
                                                            'New Chat'}
                                                    </span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                ))}
                                {hasMoreChats && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: 'More conversations',
                                            }}
                                            render={
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleOpenConversations
                                                    }
                                                    className="flex w-full items-center gap-2 text-muted-foreground"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                    <span>More</span>
                                                </button>
                                            }
                                        />
                                    </SidebarMenuItem>
                                )}
                                {chats.length === 0 && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: 'No chats yet',
                                            }}
                                            render={
                                                <button
                                                    type="button"
                                                    onClick={handleNewChat}
                                                    className="flex w-full items-center gap-2 text-muted-foreground"
                                                >
                                                    <MessageCircle className="size-4" />
                                                    <span>Start chatting</span>
                                                </button>
                                            }
                                        />
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {hasAdminAccess && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Settings</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={isActive(
                                                '/settings/users',
                                            )}
                                            tooltip={{ children: 'Users' }}
                                            render={
                                                <Link
                                                    href={
                                                        settings.users.index()
                                                            .url
                                                    }
                                                    prefetch
                                                >
                                                    <Users className="size-4" />
                                                    <span>Users</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={isActive(
                                                '/settings/roles',
                                            )}
                                            tooltip={{ children: 'Roles' }}
                                            render={
                                                <Link
                                                    href={
                                                        settings.roles.index()
                                                            .url
                                                    }
                                                    prefetch
                                                >
                                                    <Shield className="size-4" />
                                                    <span>Roles</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={page.url.startsWith(
                                                '/settings/ai',
                                            )}
                                            tooltip={{
                                                children: 'AI',
                                            }}
                                            render={
                                                <Link
                                                    href={
                                                        settings.ai.providers.index()
                                                            .url
                                                    }
                                                    prefetch
                                                >
                                                    <Bot className="size-4" />
                                                    <span>AI</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={isActive(
                                                '/settings/activities',
                                            )}
                                            tooltip={{
                                                children: 'Activities',
                                            }}
                                            render={
                                                <Link
                                                    href={
                                                        settings.activities.index()
                                                            .url
                                                    }
                                                    prefetch
                                                >
                                                    <ScrollText className="size-4" />
                                                    <span>Activities</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}
                </SidebarContent>

                <SidebarFooter>{auth.user && <NavUser />}</SidebarFooter>
            </Sidebar>

            <Dialog
                open={isConversationsOpen}
                onOpenChange={setIsConversationsOpen}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>More conversations</DialogTitle>
                        <DialogDescription>
                            Browse your full conversation history.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogPanel className="space-y-2">
                        {isConversationsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                <LoaderCircle className="size-4 animate-spin" />
                                <span>Loading conversations...</span>
                            </div>
                        ) : conversationsError ? (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                {conversationsError}
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No conversations found.
                            </p>
                        ) : (
                            conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className="group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenConversation(
                                                conversation.id,
                                            )
                                        }
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <p className="truncate text-sm font-medium">
                                            {conversation.title || 'New Chat'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Updated{' '}
                                            {formatUpdatedAt(
                                                conversation.updated_at,
                                            )}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConversation(conversation);
                                        }}
                                        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus:opacity-100"
                                        title="Delete conversation"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </DialogPanel>

                    <DialogFooter
                        variant="bare"
                        className="items-center justify-between"
                    >
                        <p className="text-xs text-muted-foreground">
                            Showing {conversationsMeta.from ?? 0} to{' '}
                            {conversationsMeta.to ?? 0} of{' '}
                            {conversationsMeta.total}
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={
                                    isConversationsLoading ||
                                    conversationsMeta.current_page <= 1
                                }
                            >
                                Previous
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Page {conversationsMeta.current_page} of{' '}
                                {conversationsMeta.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={
                                    isConversationsLoading ||
                                    conversationsMeta.current_page >=
                                        conversationsMeta.last_page
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                onSuccess={() => {
                                    setDeleteConversation(null);

                                    // If we're on the deleted chat page, redirect
                                    if (
                                        page.url ===
                                        `/chat/${deleteConversation.id}`
                                    ) {
                                        router.visit('/chat');
                                        return;
                                    }

                                    // Refresh the conversations list
                                    void fetchConversationsPage(
                                        conversationsPage,
                                    );

                                    // Also reload sidebar chats
                                    router.reload({
                                        only: ['auth'],
                                    });
                                }}
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
