import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface AvatarFormProps {
    avatarUrl?: string | null;
    userName: string;
}

export function AvatarForm({ avatarUrl, userName }: AvatarFormProps) {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setErrors({});
        }
    };

    const handleUploadDialogClose = () => {
        setUploadDialogOpen(false);
        setPreview(null);
        setSelectedFile(null);
        setErrors({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadSubmit = () => {
        if (!selectedFile) return;

        setProcessing(true);
        setErrors({});

        router.post(
            '/settings/profile/avatar',
            {
                _method: 'patch',
                avatar: selectedFile,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    handleUploadDialogClose();
                    window.location.reload();
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handleDeleteSubmit = () => {
        setProcessing(true);
        setErrors({});

        router.delete('/settings/profile/avatar', {
            data: { password },
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setPassword('');
                window.location.reload();
            },
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <Frame>
            <FrameHeader>
                <FrameTitle>Avatar</FrameTitle>
                <FrameDescription>
                    Upload and manage your avatar
                </FrameDescription>
            </FrameHeader>
            <FramePanel>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <Avatar className="size-24">
                        <AvatarImage
                            src={preview || avatarUrl || undefined}
                            alt={userName}
                        />
                        <AvatarFallback className="text-2xl">
                            {preview ? 'Preview' : initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-2">
                        {/* Upload Dialog */}
                        <Dialog
                            open={uploadDialogOpen}
                            onOpenChange={(isOpen) => {
                                if (!isOpen) {
                                    handleUploadDialogClose();
                                } else {
                                    setUploadDialogOpen(true);
                                }
                            }}
                        >
                            <DialogTrigger
                                render={
                                    <Button variant="outline" size="sm">
                                        <Upload className="mr-2 size-4" />
                                        Upload new photo
                                    </Button>
                                }
                            />
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Upload avatar</DialogTitle>
                                    <DialogDescription>
                                        Choose a new profile picture. JPG, PNG
                                        or GIF. Max size of 2 MB.
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogPanel className="grid gap-4 py-4">
                                    {preview ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Avatar className="size-40">
                                                <AvatarImage
                                                    src={preview}
                                                    alt="Preview"
                                                />
                                            </Avatar>
                                            <p className="text-sm text-muted-foreground">
                                                Preview your new avatar
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPreview(null);
                                                    setSelectedFile(null);
                                                    setErrors({});
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value =
                                                            '';
                                                    }
                                                }}
                                            >
                                                Choose different image
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                JPG, PNG or GIF (max 2MB)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {errors.avatar && (
                                        <p className="text-sm text-destructive">
                                            {errors.avatar}
                                        </p>
                                    )}
                                </DialogPanel>

                                <DialogFooter className="gap-2">
                                    <DialogClose
                                        render={
                                            <Button variant="outline">
                                                Cancel
                                            </Button>
                                        }
                                    />
                                    <Button
                                        onClick={handleUploadSubmit}
                                        disabled={!selectedFile || processing}
                                    >
                                        {processing && (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        )}
                                        Save avatar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Delete Dialog */}
                        {avatarUrl && (
                            <Dialog
                                open={deleteDialogOpen}
                                onOpenChange={(isOpen) => {
                                    setDeleteDialogOpen(isOpen);
                                    if (!isOpen) {
                                        setPassword('');
                                        setErrors({});
                                    }
                                }}
                            >
                                <DialogTrigger
                                    render={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-fit text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            Remove
                                        </Button>
                                    }
                                />
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Remove avatar</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to remove your
                                            avatar? Your profile will use your
                                            initials instead.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogPanel className="py-4">
                                        <Input
                                            type="password"
                                            placeholder="Enter your password to confirm"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                        {errors.password && (
                                            <p className="mt-2 text-sm text-destructive">
                                                {errors.password}
                                            </p>
                                        )}
                                    </DialogPanel>
                                    <DialogFooter className="gap-2">
                                        <DialogClose
                                            render={
                                                <Button variant="outline">
                                                    Cancel
                                                </Button>
                                            }
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteSubmit}
                                            disabled={!password || processing}
                                        >
                                            {processing && (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            Remove
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </FramePanel>
        </Frame>
    );
}
