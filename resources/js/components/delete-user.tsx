import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { useRef } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <Frame>
            <FrameHeader>
                <FrameTitle>Delete account</FrameTitle>
                <FrameDescription>
                    Delete your account and all of its resources
                </FrameDescription>
            </FrameHeader>
            <FramePanel>
                <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                    <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                        <p className="font-medium">Warning</p>
                        <p className="text-sm">
                            Please proceed with caution, this cannot be undone.
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger
                            render={
                                <Button
                                    variant="destructive"
                                    data-test="delete-user-button"
                                >
                                    Delete account
                                </Button>
                            }
                        />
                        <DialogContent>
                            <Form
                                {...ProfileController.destroy.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                onError={() => passwordInput.current?.focus()}
                                resetOnSuccess
                            >
                                {({
                                    resetAndClearErrors,
                                    processing,
                                    errors,
                                }) => (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Are you sure you want to delete
                                                your account?
                                            </DialogTitle>
                                            <DialogDescription>
                                                Once your account is deleted,
                                                all of its resources and data
                                                will also be permanently
                                                deleted. Please enter your
                                                password to confirm you would
                                                like to permanently delete your
                                                account.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-2 px-6 py-4">
                                            <Label
                                                htmlFor="password"
                                                className="sr-only"
                                            >
                                                Password
                                            </Label>

                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                ref={passwordInput}
                                                placeholder="Password"
                                                autoComplete="current-password"
                                            />

                                            <FieldError
                                                error={errors.password}
                                            />
                                        </div>

                                        <DialogFooter>
                                            <DialogClose
                                                render={
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() =>
                                                            resetAndClearErrors()
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                }
                                            />

                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                Delete account
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </FramePanel>
        </Frame>
    );
}
