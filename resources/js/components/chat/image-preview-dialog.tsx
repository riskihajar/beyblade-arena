'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogPopup,
    DialogTrigger,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { ReactElement } from 'react';

interface ImagePreviewDialogProps {
    src: string;
    alt: string;
    trigger: ReactElement;
}

export function ImagePreviewDialog({
    src,
    alt,
    trigger,
}: ImagePreviewDialogProps) {
    return (
        <Dialog>
            <DialogTrigger render={trigger} />
            <DialogPopup
                className="w-auto max-w-[92vw] border-0 bg-transparent p-0 shadow-none"
                showCloseButton={false}
                bottomStickOnMobile={false}
            >
                <div className="relative mx-auto inline-flex max-h-[88vh] max-w-[88vw] items-center justify-center rounded-xl">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain"
                    />
                    <DialogClose
                        aria-label="Close preview"
                        className="absolute top-3 right-3"
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-full bg-black/60 text-white shadow-none hover:bg-black/75"
                            />
                        }
                    >
                        <X className="size-5" />
                    </DialogClose>
                </div>
            </DialogPopup>
        </Dialog>
    );
}
