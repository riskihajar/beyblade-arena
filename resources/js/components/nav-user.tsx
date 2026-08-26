import { LogoutDialog } from '@/components/logout-dialog';
import { NotificationsSheet } from '@/components/notification';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { toastManager } from '@/components/ui/toast';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import notificationsRoutes from '@/routes/notifications';
import { type Notification, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface BroadcastNotification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: string;
    data: {
        message: string;
        type?: string;
    };
    read_at: string | null;
    created_at: string;
}

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isNotificationSheetOpen, setIsNotificationSheetOpen] =
        useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(
        () => auth.notifications || [],
    );
    const [unreadCount, setUnreadCount] = useState(() => auth.unreadCount || 0);

    const channelName = `App.Models.User.${auth.user.id}`;

    useEcho<BroadcastNotification>(
        channelName,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (notification) => {
            const newNotification: Notification = {
                id: notification.id,
                type: notification.type,
                notifiable_type: notification.notifiable_type,
                notifiable_id: notification.notifiable_id,
                data: {
                    message: notification.data.message,
                    type: notification.data.type || 'info',
                },
                read_at: notification.read_at,
                created_at: notification.created_at,
                updated_at: notification.created_at,
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            toastManager.add({
                type: notification.data.type || 'info',
                title: 'New Notification',
                description: notification.data.message,
            });
        },
    );

    const markAsRead = (id: string) => {
        router.post(
            notificationsRoutes.read(id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === id
                                ? { ...n, read_at: new Date().toISOString() }
                                : n,
                        ),
                    );
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                },
            },
        );
    };

    const markAllRead = () => {
        router.post(
            notificationsRoutes.readAll().url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications((prev) =>
                        prev.map((n) => ({
                            ...n,
                            read_at: new Date().toISOString(),
                        })),
                    );
                    setUnreadCount(0);
                },
            },
        );
    };

    const deleteNotification = (id: string) => {
        router.delete(notificationsRoutes.destroy(id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications((prev) => {
                    const notification = prev.find((n) => n.id === id);
                    if (notification && !notification.read_at) {
                        setUnreadCount((count) => Math.max(0, count - 1));
                    }
                    return prev.filter((n) => n.id !== id);
                });
            },
        });
    };

    const deleteAll = () => {
        router.delete(notificationsRoutes.clearAll().url, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications([]);
                setUnreadCount(0);
            },
        });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[open]:bg-sidebar-accent"
                                data-test="sidebar-menu-button"
                            >
                                <UserInfo
                                    user={auth.user}
                                    showNotificationBadge={unreadCount > 0}
                                />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent
                            user={auth.user}
                            unreadCount={unreadCount}
                            onLogout={() => setShowLogoutDialog(true)}
                            onOpenNotifications={() =>
                                setIsNotificationSheetOpen(true)
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>

                <LogoutDialog
                    open={showLogoutDialog}
                    onOpenChange={setShowLogoutDialog}
                />

                <NotificationsSheet
                    isOpen={isNotificationSheetOpen}
                    onOpenChange={setIsNotificationSheetOpen}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllRead={markAllRead}
                    onDelete={deleteNotification}
                    onDeleteAll={deleteAll}
                />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
