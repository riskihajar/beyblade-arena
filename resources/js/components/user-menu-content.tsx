import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { Bell, LogOut, Settings } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
    unreadCount: number;
    onLogout: () => void;
    onOpenNotifications: () => void;
}

export function UserMenuContent({
    user,
    unreadCount,
    onLogout,
    onOpenNotifications,
}: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <UserInfo user={user} showEmail={true} />
                    </div>
                </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem
                    render={
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-base outline-none hover:bg-accent hover:text-accent-foreground sm:text-sm"
                            onClick={onOpenNotifications}
                        >
                            <Bell className="mr-2 size-4" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                            )}
                        </button>
                    }
                    nativeButton
                />
                <DropdownMenuItem
                    render={
                        <Link
                            className="block w-full"
                            href={edit()}
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Settings className="mr-2" />
                            Settings
                        </Link>
                    }
                    nativeButton
                />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                render={
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-base outline-none hover:bg-accent hover:text-accent-foreground sm:text-sm"
                        onClick={() => onLogout()}
                        data-test="logout-button"
                    >
                        <LogOut className="mr-2 size-4" />
                        Log out
                    </button>
                }
                nativeButton
            />
        </>
    );
}
