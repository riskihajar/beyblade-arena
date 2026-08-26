import { ModelPickerDialog } from '@/components/model-picker-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset';
import { FormInput } from '@/components/ui/form-input';
import {
    Frame,
    FrameDescription,
    FrameHeader,
    FramePanel,
    FrameTitle,
} from '@/components/ui/frame';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, List } from 'lucide-react';
import { useState } from 'react';

interface ProviderOption {
    value: string;
    label: string;
}

interface Props {
    providers: ProviderOption[];
}

export default function ModelsCreate({ providers }: Props) {
    const { ai } = settings;
    const [isActive, setIsActive] = useState(true);
    const [isDefault, setIsDefault] = useState(false);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [modelId, setModelId] = useState('');
    const [modelName, setModelName] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [capabilities, setCapabilities] = useState({
        supports_web_search: false,
        supports_attachments: true,
        supports_images: true,
        supports_documents: true,
        supports_provider_storage: false,
    });

    const toggleCapability = (key: keyof typeof capabilities) => {
        setCapabilities((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <>
            <Head title="Add AI Model" />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    { title: 'AI Models', href: ai.models.index().url },
                    { title: 'Create', href: ai.models.create().url },
                ]}
            >
                <div className="max-w-2xl px-4 py-8">
                    <Form
                        action={ai.models.store()}
                        method="post"
                        transform={(data) => ({
                            ...data,
                            ai_provider_id: selectedProviderId,
                            model_id: modelId,
                            name: modelName,
                            is_active: isActive,
                            is_default: isDefault,
                            ...capabilities,
                        })}
                    >
                        {({ processing, errors }) => (
                            <>
                                <Frame>
                                    <FrameHeader>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                render={
                                                    <Link
                                                        href={
                                                            ai.models.index()
                                                                .url
                                                        }
                                                    >
                                                        <ArrowLeft className="size-4" />
                                                    </Link>
                                                }
                                            />
                                            <div>
                                                <FrameTitle>
                                                    Add AI Model
                                                </FrameTitle>
                                                <FrameDescription>
                                                    Register a new model with a
                                                    provider.
                                                </FrameDescription>
                                            </div>
                                        </div>
                                    </FrameHeader>
                                    <FramePanel>
                                        <div className="space-y-6">
                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Model Details
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="ai_provider_id">
                                                            Provider
                                                        </Label>
                                                        <Select
                                                            name="ai_provider_id"
                                                            value={
                                                                selectedProviderId ||
                                                                null
                                                            }
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                setSelectedProviderId(
                                                                    v as string,
                                                                )
                                                            }
                                                            required
                                                        >
                                                            <SelectTrigger id="ai_provider_id">
                                                                <SelectValue>
                                                                    {(
                                                                        value: string,
                                                                    ) =>
                                                                        providers.find(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.value ===
                                                                                value,
                                                                        )
                                                                            ?.label ??
                                                                        value
                                                                    }
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {providers.map(
                                                                    (p) => (
                                                                        <SelectItem
                                                                            key={
                                                                                p.value
                                                                            }
                                                                            value={
                                                                                p.value
                                                                            }
                                                                        >
                                                                            {
                                                                                p.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.ai_provider_id && (
                                                            <p className="text-sm text-red-500">
                                                                {
                                                                    errors.ai_provider_id
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="model_id">
                                                            Model ID
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                id="model_id"
                                                                name="model_id"
                                                                placeholder="e.g. gpt-4o, claude-sonnet-4-20250514"
                                                                value={modelId}
                                                                onChange={(e) =>
                                                                    setModelId(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="shrink-0"
                                                                disabled={
                                                                    !selectedProviderId
                                                                }
                                                                onClick={() =>
                                                                    setPickerOpen(
                                                                        true,
                                                                    )
                                                                }
                                                                title="Browse models from provider"
                                                            >
                                                                <List className="size-4" />
                                                            </Button>
                                                        </div>
                                                        {errors.model_id && (
                                                            <p className="text-sm text-red-500">
                                                                {
                                                                    errors.model_id
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">
                                                            Display Name
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            placeholder="e.g. GPT-4o, Claude Sonnet 4"
                                                            value={modelName}
                                                            onChange={(e) =>
                                                                setModelName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            required
                                                        />
                                                        {errors.name && (
                                                            <p className="text-sm text-red-500">
                                                                {errors.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Fieldset>

                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Capabilities
                                                </FieldsetLegend>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {(
                                                        [
                                                            [
                                                                'supports_web_search',
                                                                'Web Search',
                                                            ],
                                                            [
                                                                'supports_attachments',
                                                                'File Attachments',
                                                            ],
                                                            [
                                                                'supports_images',
                                                                'Image Upload',
                                                            ],
                                                            [
                                                                'supports_documents',
                                                                'Document Upload',
                                                            ],
                                                            [
                                                                'supports_provider_storage',
                                                                'Provider Storage',
                                                            ],
                                                        ] as const
                                                    ).map(([key, label]) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Checkbox
                                                                id={key}
                                                                checked={
                                                                    capabilities[
                                                                        key
                                                                    ]
                                                                }
                                                                onCheckedChange={() =>
                                                                    toggleCapability(
                                                                        key,
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={key}
                                                                className="cursor-pointer text-sm"
                                                            >
                                                                {label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Fieldset>

                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Settings
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <FormInput
                                                        name="sort_order"
                                                        label="Sort Order"
                                                        type="number"
                                                        defaultValue="0"
                                                        errors={errors}
                                                    />
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                id="is_active"
                                                                checked={
                                                                    isActive
                                                                }
                                                                onCheckedChange={(
                                                                    c,
                                                                ) =>
                                                                    setIsActive(
                                                                        !!c,
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor="is_active"
                                                                className="cursor-pointer"
                                                            >
                                                                Active
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                id="is_default"
                                                                checked={
                                                                    isDefault
                                                                }
                                                                onCheckedChange={(
                                                                    c,
                                                                ) =>
                                                                    setIsDefault(
                                                                        !!c,
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor="is_default"
                                                                className="cursor-pointer"
                                                            >
                                                                Default Model
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Fieldset>
                                        </div>
                                    </FramePanel>
                                </Frame>
                                <div className="mt-4 flex gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Create Model
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        render={
                                            <Link href={ai.models.index().url}>
                                                Cancel
                                            </Link>
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </Form>

                    <ModelPickerDialog
                        providerId={selectedProviderId}
                        open={pickerOpen}
                        onOpenChange={setPickerOpen}
                        onSelect={(id, name) => {
                            setModelId(id);
                            setModelName(name);
                        }}
                    />
                </div>
            </AppLayout>
        </>
    );
}
