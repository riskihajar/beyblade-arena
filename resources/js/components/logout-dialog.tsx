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
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { router } from '@inertiajs/react';
import type { Dispatch, SetStateAction } from 'react';

interface LogoutDialogProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
        router.post(logout());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm logout</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to log out of your account?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose
                        render={<Button variant="secondary">Cancel</Button>}
                    />
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        data-test="confirm-logout-button"
                    >
                        Log out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
