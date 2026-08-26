'use client';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandCollection,
    CommandDialog,
    CommandDialogPopup,
    CommandDialogTrigger,
    CommandEmpty,
    CommandFooter,
    CommandGroup,
    CommandGroupLabel,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
    type GlobalSearchItem,
    type GlobalSearchResponse,
    type SharedData,
} from '@/types';
import { router, usePage } from '@inertiajs/react';
import { FileText, Loader2, Search, User } from 'lucide-react';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

interface CommandGroupData {
    value: string;
    type?: string;
    items: Array<GlobalSearchItem & { value: string; description?: string }>;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function GlobalSearch() {
    const { globalSearch } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<
        GlobalSearchResponse['results']
    >([]);
    const [isSearching, setIsSearching] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const debouncedQuery = useDebounce(query, 300);

    const isMac = useMemo(() => {
        if (typeof window === 'undefined') {
            return true;
        }
        return /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
    }, []);

    // Navigation groups from shared props
    const navigationGroups = useMemo<CommandGroupData[]>(() => {
        return globalSearch.groups
            .map((group) => ({
                value: group.label,
                type: 'navigation',
                items: group.items.map((item) => ({
                    ...item,
                    value: [item.label, ...item.keywords].join(' '),
                })),
            }))
            .filter((group) => group.items.length > 0);
    }, [globalSearch.groups]);

    // Combined groups: search results + navigation
    const commandGroups = useMemo<CommandGroupData[]>(() => {
        // If we have search results from API, show them first
        const apiResultGroups: CommandGroupData[] = searchResults.map(
            (group) => ({
                value: group.label,
                type: group.type,
                items: group.items.map((item) => ({
                    label: item.label,
                    href: item.href,
                    keywords: [item.description],
                    value: [item.label, item.description].join(' '),
                    description: item.description,
                })),
            }),
        );

        // If no query, only show navigation
        if (!debouncedQuery.trim()) {
            return navigationGroups;
        }

        // Show API results + filtered navigation
        return [...apiResultGroups, ...navigationGroups];
    }, [searchResults, navigationGroups, debouncedQuery]);

    // Fetch search results from API
    const fetchSearchResults = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsSearching(true);

        try {
            const response = await fetch(
                `/global-search?q=${encodeURIComponent(searchQuery)}`,
                {
                    signal: abortControllerRef.current.signal,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data: GlobalSearchResponse = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Search error:', error);
            }
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Effect to trigger search when debounced query changes
    useEffect(() => {
        fetchSearchResults(debouncedQuery);
    }, [debouncedQuery, fetchSearchResults]);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery('');
            setSearchResults([]);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        }
    }, [open]);

    const handleSelect = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const getIconForType = (type?: string) => {
        switch (type) {
            case 'users':
                return <User className="mr-2 size-4 text-muted-foreground" />;
            case 'activities':
                return (
                    <FileText className="mr-2 size-4 text-muted-foreground" />
                );
            default:
                return null;
        }
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandDialogTrigger
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-muted-foreground"
                    >
                        <Search className="size-4" />
                        <span className="text-sm">Search</span>
                        <KbdGroup className="ml-auto">
                            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                            <Kbd>K</Kbd>
                        </KbdGroup>
                    </Button>
                }
            />
            <CommandDialogPopup>
                <Command items={commandGroups}>
                    <div className="relative">
                        <CommandInput
                            placeholder="Search pages, users, activities..."
                            value={query}
                            onChange={handleInputChange}
                        />
                        {isSearching && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <CommandEmpty>
                        {isSearching
                            ? 'Searching...'
                            : query.length < 2 && query.length > 0
                              ? 'Type at least 2 characters to search...'
                              : 'No results found.'}
                    </CommandEmpty>
                    <CommandList>
                        {commandGroups.map((group, index) => (
                            <Fragment key={`${group.type}-${group.value}`}>
                                <CommandGroup items={group.items}>
                                    <CommandGroupLabel>
                                        {group.value}
                                    </CommandGroupLabel>
                                    <CommandCollection>
                                        {(item) => (
                                            <CommandItem
                                                key={item.href}
                                                value={item.value}
                                                onClick={() =>
                                                    handleSelect(item.href)
                                                }
                                            >
                                                {getIconForType(group.type)}
                                                <div className="flex flex-col">
                                                    <span>{item.label}</span>
                                                    {item.description && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        )}
                                    </CommandCollection>
                                </CommandGroup>
                                {index < commandGroups.length - 1 && (
                                    <CommandSeparator />
                                )}
                            </Fragment>
                        ))}
                    </CommandList>
                    <CommandFooter>
                        <span>Navigate with ↑ ↓ and press Enter.</span>
                        <span className="flex items-center gap-1">
                            <Kbd>Esc</Kbd> to close
                        </span>
                    </CommandFooter>
                </Command>
            </CommandDialogPopup>
        </CommandDialog>
    );
}
