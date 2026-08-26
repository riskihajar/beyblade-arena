import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    showNotificationBadge = false,
}: {
    user: User;
    showEmail?: boolean;
    showNotificationBadge?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <div className="relative">
                <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                    <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                {showNotificationBadge && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-red-500" />
                )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
