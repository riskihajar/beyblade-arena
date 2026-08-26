import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogPanel,
    DialogPopup,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import settings from '@/routes/settings';
import { Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ProviderModel {
    id: string;
    name: string;
}

interface ModelPickerDialogProps {
    providerId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (modelId: string, name: string) => void;
}

export function ModelPickerDialog({
    providerId,
    open,
    onOpenChange,
    onSelect,
}: ModelPickerDialogProps) {
    const [models, setModels] = useState<ProviderModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchModels = useCallback(async () => {
        if (!providerId) return;

        setLoading(true);
        setError('');
        setModels([]);

        try {
            const url = settings.ai.providers.listModels({
                provider: providerId,
            }).url;
            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const data = await res.json();

            if (data.success) {
                setModels(data.models);
            } else {
                setError(data.message || 'Failed to load models.');
            }
        } catch {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    }, [providerId]);

    useEffect(() => {
        if (open && providerId) {
            fetchModels();
            setSearch('');
        }
    }, [open, providerId, fetchModels]);

    const filtered = models.filter(
        (m) =>
            m.id.toLowerCase().includes(search.toLowerCase()) ||
            m.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Browse Models</DialogTitle>
                    <DialogDescription>
                        Select a model from the provider&apos;s available
                        models.
                    </DialogDescription>
                </DialogHeader>
                <DialogPanel>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search models..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">
                                    Loading models...
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filtered.length === 0 && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                {models.length === 0
                                    ? 'No models found.'
                                    : 'No models matching your search.'}
                            </div>
                        )}

                        {!loading && filtered.length > 0 && (
                            <div className="max-h-80 space-y-1 overflow-y-auto">
                                {filtered.map((model) => (
                                    <Button
                                        key={model.id}
                                        type="button"
                                        variant="ghost"
                                        className="h-auto w-full justify-start px-3 py-2 text-left"
                                        onClick={() => {
                                            onSelect(model.id, model.name);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">
                                                {model.name !== model.id
                                                    ? model.name
                                                    : model.id}
                                            </span>
                                            {model.name !== model.id && (
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {model.id}
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogPanel>
            </DialogPopup>
        </Dialog>
    );
}
