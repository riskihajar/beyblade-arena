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
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import AppLayout from '@/layouts/app-layout';
import settings from '@/routes/settings';
import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Copy,
    Eye,
    EyeOff,
    Loader2,
    Plug,
} from 'lucide-react';
import { useState } from 'react';

interface Driver {
    value: string;
    label: string;
}

interface ProviderData {
    id: string;
    slug: string;
    name: string;
    driver: string;
    base_url: string | null;
    api_key: string;
    auth_type: 'bearer' | 'basic' | 'none';
    auth_username: string;
    auth_password: string;
    extra_config: string;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    provider: ProviderData;
    drivers: Driver[];
}

export default function ProvidersEdit({ provider, drivers }: Props) {
    const { ai } = settings;
    const [selectedDriver, setSelectedDriver] = useState(provider.driver);
    const [isActive, setIsActive] = useState(provider.is_active);
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKey, setApiKey] = useState(provider.api_key ?? '');
    const [authType, setAuthType] = useState<'bearer' | 'basic' | 'none'>(
        provider.auth_type ?? 'bearer',
    );
    const [authUsername, setAuthUsername] = useState(
        provider.auth_username ?? '',
    );
    const [authPassword, setAuthPassword] = useState(
        provider.auth_password ?? '',
    );
    const { copyToClipboard, isCopied } = useCopyToClipboard();
    const [testStatus, setTestStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    const [testMessage, setTestMessage] = useState('');
    const isBedrockNative = selectedDriver === 'bedrock';

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestMessage('');
        try {
            const url = ai.providers.testConnection({
                provider: provider.id,
            }).url;
            const csrfToken =
                document.querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )?.content ?? '';
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            setTestStatus(data.success ? 'success' : 'error');
            setTestMessage(data.message);
        } catch {
            setTestStatus('error');
            setTestMessage('Network error.');
        }
    };

    return (
        <>
            <Head title={`Edit ${provider.name}`} />
            <AppLayout
                breadcrumbs={[
                    { title: 'Settings', href: settings.users.index().url },
                    {
                        title: 'AI Providers',
                        href: ai.providers.index().url,
                    },
                    {
                        title: provider.name,
                        href: ai.providers.edit({ provider: provider.id }).url,
                    },
                ]}
            >
                <div className="max-w-2xl px-4 py-8">
                    <Form
                        action={ai.providers.update({
                            provider: provider.id,
                        })}
                        method="patch"
                        transform={(data) => ({
                            ...data,
                            driver: selectedDriver,
                            is_active: isActive,
                            auth_type: isBedrockNative ? 'none' : authType,
                            auth_username: isBedrockNative ? '' : authUsername,
                            auth_password: isBedrockNative ? '' : authPassword,
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
                                                            ai.providers.index()
                                                                .url
                                                        }
                                                    >
                                                        <ArrowLeft className="size-4" />
                                                    </Link>
                                                }
                                            />
                                            <div>
                                                <FrameTitle>
                                                    Edit Provider
                                                </FrameTitle>
                                                <FrameDescription>
                                                    Update provider settings for{' '}
                                                    {provider.name}.
                                                </FrameDescription>
                                            </div>
                                        </div>
                                    </FrameHeader>
                                    <FramePanel>
                                        <div className="space-y-6">
                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Provider Details
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    <FormInput
                                                        name="name"
                                                        label="Display Name"
                                                        defaultValue={
                                                            provider.name
                                                        }
                                                        required
                                                        errors={errors}
                                                    />
                                                    <FormInput
                                                        name="slug"
                                                        label="Slug"
                                                        defaultValue={
                                                            provider.slug
                                                        }
                                                        required
                                                        errors={errors}
                                                    />
                                                    <div className="space-y-2">
                                                        <Label htmlFor="driver">
                                                            Driver
                                                        </Label>
                                                        <Select
                                                            name="driver"
                                                            value={
                                                                selectedDriver
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setSelectedDriver(
                                                                    value as string,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger id="driver">
                                                                <SelectValue>
                                                                    {(
                                                                        value: string,
                                                                    ) =>
                                                                        drivers.find(
                                                                            (
                                                                                d,
                                                                            ) =>
                                                                                d.value ===
                                                                                value,
                                                                        )
                                                                            ?.label ??
                                                                        value
                                                                    }
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {drivers.map(
                                                                    (d) => (
                                                                        <SelectItem
                                                                            key={
                                                                                d.value
                                                                            }
                                                                            value={
                                                                                d.value
                                                                            }
                                                                        >
                                                                            {
                                                                                d.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.driver && (
                                                            <p className="text-sm text-red-500">
                                                                {errors.driver}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Fieldset>

                                            <Fieldset className="rounded-lg border p-4">
                                                <FieldsetLegend className="px-2 text-sm font-medium text-muted-foreground">
                                                    Connection
                                                </FieldsetLegend>
                                                <div className="flex flex-col gap-4">
                                                    {isBedrockNative ? (
                                                        <div className="space-y-2">
                                                            <div className="rounded-lg border border-dashed border-amber-300/70 bg-amber-50/60 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
                                                                <p className="font-medium">
                                                                    AWS Bedrock
                                                                    native mode
                                                                </p>
                                                                <p className="mt-1 text-muted-foreground">
                                                                    This
                                                                    provider
                                                                    uses AWS
                                                                    credentials
                                                                    from your
                                                                    environment
                                                                    or AWS
                                                                    credential
                                                                    chain. Base
                                                                    URL and auth
                                                                    type are
                                                                    ignored for
                                                                    native
                                                                    Bedrock
                                                                    connections.
                                                                </p>
                                                            </div>
                                                            <Label htmlFor="api_key">
                                                                Bearer Token
                                                                (optional)
                                                            </Label>
                                                            <InputGroup>
                                                                <InputGroupInput
                                                                    id="api_key"
                                                                    name="api_key"
                                                                    type={
                                                                        showApiKey
                                                                            ? 'text'
                                                                            : 'password'
                                                                    }
                                                                    placeholder="Optional Bedrock bearer token"
                                                                    value={
                                                                        apiKey
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setApiKey(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <InputGroupAddon align="inline-end">
                                                                    <Button
                                                                        type="button"
                                                                        size="icon-xs"
                                                                        variant="ghost"
                                                                        aria-label="Copy API key"
                                                                        onClick={() =>
                                                                            copyToClipboard(
                                                                                apiKey,
                                                                            )
                                                                        }
                                                                        tabIndex={
                                                                            -1
                                                                        }
                                                                    >
                                                                        {isCopied ? (
                                                                            <Check />
                                                                        ) : (
                                                                            <Copy />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="icon-xs"
                                                                        variant="ghost"
                                                                        aria-label={
                                                                            showApiKey
                                                                                ? 'Hide API key'
                                                                                : 'Show API key'
                                                                        }
                                                                        onClick={() =>
                                                                            setShowApiKey(
                                                                                !showApiKey,
                                                                            )
                                                                        }
                                                                        tabIndex={
                                                                            -1
                                                                        }
                                                                    >
                                                                        {showApiKey ? (
                                                                            <EyeOff />
                                                                        ) : (
                                                                            <Eye />
                                                                        )}
                                                                    </Button>
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                            {errors.api_key && (
                                                                <p className="text-sm text-red-500">
                                                                    {
                                                                        errors.api_key
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FormInput
                                                                name="base_url"
                                                                label="Base URL"
                                                                defaultValue={
                                                                    provider.base_url ??
                                                                    ''
                                                                }
                                                                errors={errors}
                                                            />
                                                            <div className="space-y-2">
                                                                <Label>
                                                                    Auth Type
                                                                </Label>
                                                                <div className="flex gap-4">
                                                                    {(
                                                                        [
                                                                            [
                                                                                'bearer',
                                                                                'Bearer Token',
                                                                            ],
                                                                            [
                                                                                'basic',
                                                                                'Basic Auth',
                                                                            ],
                                                                            [
                                                                                'none',
                                                                                'None',
                                                                            ],
                                                                        ] as const
                                                                    ).map(
                                                                        ([
                                                                            value,
                                                                            label,
                                                                        ]) => (
                                                                            <label
                                                                                key={
                                                                                    value
                                                                                }
                                                                                className="flex cursor-pointer items-center gap-2"
                                                                            >
                                                                                <input
                                                                                    type="radio"
                                                                                    name="_auth_type_radio"
                                                                                    value={
                                                                                        value
                                                                                    }
                                                                                    checked={
                                                                                        authType ===
                                                                                        value
                                                                                    }
                                                                                    onChange={() =>
                                                                                        setAuthType(
                                                                                            value,
                                                                                        )
                                                                                    }
                                                                                    className="accent-primary"
                                                                                />
                                                                                <span className="text-sm">
                                                                                    {
                                                                                        label
                                                                                    }
                                                                                </span>
                                                                            </label>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {authType ===
                                                                'bearer' && (
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="api_key">
                                                                        API Key
                                                                    </Label>
                                                                    <InputGroup>
                                                                        <InputGroupInput
                                                                            id="api_key"
                                                                            name="api_key"
                                                                            type={
                                                                                showApiKey
                                                                                    ? 'text'
                                                                                    : 'password'
                                                                            }
                                                                            placeholder="sk-..."
                                                                            value={
                                                                                apiKey
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setApiKey(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <InputGroupAddon align="inline-end">
                                                                            <Button
                                                                                type="button"
                                                                                size="icon-xs"
                                                                                variant="ghost"
                                                                                aria-label="Copy API key"
                                                                                onClick={() =>
                                                                                    copyToClipboard(
                                                                                        apiKey,
                                                                                    )
                                                                                }
                                                                                tabIndex={
                                                                                    -1
                                                                                }
                                                                            >
                                                                                {isCopied ? (
                                                                                    <Check />
                                                                                ) : (
                                                                                    <Copy />
                                                                                )}
                                                                            </Button>
                                                                            <Button
                                                                                type="button"
                                                                                size="icon-xs"
                                                                                variant="ghost"
                                                                                aria-label={
                                                                                    showApiKey
                                                                                        ? 'Hide API key'
                                                                                        : 'Show API key'
                                                                                }
                                                                                onClick={() =>
                                                                                    setShowApiKey(
                                                                                        !showApiKey,
                                                                                    )
                                                                                }
                                                                                tabIndex={
                                                                                    -1
                                                                                }
                                                                            >
                                                                                {showApiKey ? (
                                                                                    <EyeOff />
                                                                                ) : (
                                                                                    <Eye />
                                                                                )}
                                                                            </Button>
                                                                        </InputGroupAddon>
                                                                    </InputGroup>
                                                                    {errors.api_key && (
                                                                        <p className="text-sm text-red-500">
                                                                            {
                                                                                errors.api_key
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {authType ===
                                                                'basic' && (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="auth_username">
                                                                            Username
                                                                        </Label>
                                                                        <InputGroupInput
                                                                            id="auth_username"
                                                                            placeholder="admin"
                                                                            value={
                                                                                authUsername
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setAuthUsername(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="auth_password">
                                                                            Password
                                                                        </Label>
                                                                        <InputGroupInput
                                                                            id="auth_password"
                                                                            type="password"
                                                                            placeholder="••••••"
                                                                            value={
                                                                                authPassword
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setAuthPassword(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="extra_config">
                                                            Extra Config (JSON)
                                                        </Label>
                                                        <Textarea
                                                            id="extra_config"
                                                            name="extra_config"
                                                            defaultValue={
                                                                provider.extra_config
                                                            }
                                                            placeholder={
                                                                isBedrockNative
                                                                    ? '{"region": "us-east-1"}'
                                                                    : '{"key": "value"}'
                                                            }
                                                            rows={3}
                                                            className="font-mono text-sm"
                                                        />
                                                        {errors.extra_config && (
                                                            <p className="text-sm text-red-500">
                                                                {
                                                                    errors.extra_config
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
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
                                                        defaultValue={String(
                                                            provider.sort_order,
                                                        )}
                                                        errors={errors}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="is_active"
                                                            checked={isActive}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setIsActive(
                                                                    !!checked,
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
                                                </div>
                                            </Fieldset>
                                        </div>
                                    </FramePanel>
                                </Frame>
                                <div className="mt-4 flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Update Provider
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={testStatus === 'loading'}
                                        onClick={handleTestConnection}
                                    >
                                        {testStatus === 'loading' ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <Plug />
                                        )}
                                        Test Connection
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        render={
                                            <Link
                                                href={ai.providers.index().url}
                                            >
                                                Cancel
                                            </Link>
                                        }
                                    />
                                    {testMessage && (
                                        <span
                                            className={`text-sm ${
                                                testStatus === 'success'
                                                    ? 'text-green-500'
                                                    : 'text-red-500'
                                            }`}
                                        >
                                            {testMessage}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </AppLayout>
        </>
    );
}
