import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { LogoutDialog } from '@/components/logout-dialog';
import { NotificationsSheet } from '@/components/notification';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { toastManager } from '@/components/ui/toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import notificationsRoutes from '@/routes/notifications';
import {
    type BreadcrumbItem,
    type NavItem,
    type Notification,
    type SharedData,
} from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { BookOpen, Folder, LayoutGrid, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
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
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mr-2 h-[34px] w-[34px]"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                }
                            />
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={resolveUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-5 w-5"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                isSameUrl(
                                                    page.url,
                                                    item.href,
                                                ) && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="mr-2 h-4 w-4"
                                                />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isSameUrl(page.url, item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delay={0}>
                                        <Tooltip>
                                            <TooltipTrigger
                                                render={
                                                    <a
                                                        href={resolveUrl(
                                                            item.href,
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                    >
                                                        <span className="sr-only">
                                                            {item.title}
                                                        </span>
                                                        {item.icon && (
                                                            <Icon
                                                                iconNode={
                                                                    item.icon
                                                                }
                                                                className="size-5 opacity-80 group-hover:opacity-100"
                                                            />
                                                        )}
                                                    </a>
                                                }
                                            />
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar as
                                                        | string
                                                        | undefined
                                                }
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent className="w-56" align="end">
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
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
