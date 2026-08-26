import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetPanel,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { toastManager } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import notificationsRoutes from '@/routes/notifications';
import { type Notification, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Bell, Check, Trash2 } from 'lucide-react';
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

interface NotificationsSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllRead: () => void;
    onDelete: (id: string) => void;
    onDeleteAll: () => void;
}

export function NotificationsSheet({
    isOpen,
    onOpenChange,
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllRead,
    onDelete,
    onDeleteAll,
}: NotificationsSheetProps) {
    const [deleteNotification, setDeleteNotification] =
        useState<Notification | null>(null);
    const [showClearAllDialog, setShowClearAllDialog] = useState(false);

    const confirmDelete = () => {
        if (deleteNotification) {
            onDelete(deleteNotification.id);
            setDeleteNotification(null);
        }
    };

    const confirmClearAll = () => {
        onDeleteAll();
        setShowClearAllDialog(false);
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent>
                    <SheetHeader>
                        <div className="flex items-center justify-between gap-2">
                            <SheetTitle>Notifications</SheetTitle>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onMarkAllRead}
                                        className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <Check className="mr-1 h-3 w-3" />
                                        Mark all read
                                    </Button>
                                )}
                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setShowClearAllDialog(true)
                                        }
                                        className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />
                                        Clear all
                                    </Button>
                                )}
                            </div>
                        </div>
                        <SheetDescription>
                            You have {unreadCount} unread messages.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
                        <SheetPanel className="flex flex-col gap-2">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            'relative flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted/50',
                                            !notification.read_at &&
                                                'border-l-4 border-l-blue-500 bg-muted/30',
                                        )}
                                    >
                                        <div className="flex w-full justify-between gap-2">
                                            <span className="font-medium">
                                                {notification.data.message}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleDateString()}{' '}
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleTimeString()}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {!notification.read_at && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 shrink-0"
                                                        onClick={() =>
                                                            onMarkAsRead(
                                                                notification.id,
                                                            )
                                                        }
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        <span className="sr-only">
                                                            Mark as read
                                                        </span>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                                    onClick={() =>
                                                        setDeleteNotification(
                                                            notification,
                                                        )
                                                    }
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span className="sr-only">
                                                        Delete notification
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </SheetPanel>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <Dialog
                open={!!deleteNotification}
                onOpenChange={() => setDeleteNotification(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Notification</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this notification?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showClearAllDialog}
                onOpenChange={setShowClearAllDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear All Notifications</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all{' '}
                            {notifications.length} notifications? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose
                            render={<Button variant="secondary">Cancel</Button>}
                        />
                        <Button variant="destructive" onClick={confirmClearAll}>
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function NotificationsMenuTrigger() {
    const { auth } = usePage<SharedData>().props;
    const [notifications, setNotifications] = useState<Notification[]>(
        () => auth.notifications || [],
    );
    const [unreadCount, setUnreadCount] = useState(() => auth.unreadCount || 0);
    const [isOpen, setIsOpen] = useState(false);

    const channelName = `App.Models.User.${auth.user.id}`;

    useEcho<BroadcastNotification>(
        channelName,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (notification) => {
            console.log('✅ Notification received via useEcho:', notification);

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

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'w-full justify-start',
                )}
                type="button"
            >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                )}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>Notifications</SheetTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllRead}
                                className="h-auto px-2 text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                    </div>
                    <SheetDescription>
                        You have {unreadCount} unread messages.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
                    <SheetPanel className="flex flex-col gap-2">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'relative flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted/50',
                                        !notification.read_at &&
                                            'border-l-4 border-l-blue-500 bg-muted/30',
                                    )}
                                >
                                    <div className="flex w-full justify-between gap-2">
                                        <span className="font-medium">
                                            {notification.data.message}
                                        </span>
                                        {!notification.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0"
                                                onClick={() =>
                                                    markAsRead(notification.id)
                                                }
                                                title="Mark as read"
                                            >
                                                <Check className="h-3 w-3" />
                                                <span className="sr-only">
                                                    Mark as read
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            notification.created_at,
                                        ).toLocaleDateString()}{' '}
                                        {new Date(
                                            notification.created_at,
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </SheetPanel>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
