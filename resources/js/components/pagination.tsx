import {
    Pagination as BasePagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationObjectLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export type PaginationLinksData = PaginationObjectLinks | PaginationLinkItem[];

interface PaginationLinksProps {
    links: PaginationLinksData;
    currentPage?: number;
    lastPage?: number;
    showPageInfo?: boolean;
    className?: string;
}

export function PaginationLinks({
    links,
    currentPage,
    lastPage,
    showPageInfo = false,
    className,
}: PaginationLinksProps) {
    return (
        <BasePagination className={className}>
            <PaginationContent>
                {Array.isArray(links) ? (
                    links.map((link, index) => {
                        const key = `${link.label}-${link.url ?? 'disabled'}-${index}`;

                        if (link.label.includes('Previous')) {
                            return (
                                <PaginationItem key={key}>
                                    <PaginationPrevious
                                        render={
                                            link.url ? (
                                                <Link href={link.url} />
                                            ) : (
                                                <span />
                                            )
                                        }
                                        aria-disabled={!link.url}
                                        tabIndex={!link.url ? -1 : undefined}
                                        className={
                                            !link.url
                                                ? 'pointer-events-none opacity-50'
                                                : undefined
                                        }
                                    />
                                </PaginationItem>
                            );
                        }
                        if (link.label.includes('Next')) {
                            return (
                                <PaginationItem key={key}>
                                    <PaginationNext
                                        render={
                                            link.url ? (
                                                <Link href={link.url} />
                                            ) : (
                                                <span />
                                            )
                                        }
                                        aria-disabled={!link.url}
                                        tabIndex={!link.url ? -1 : undefined}
                                        className={
                                            !link.url
                                                ? 'pointer-events-none opacity-50'
                                                : undefined
                                        }
                                    />
                                </PaginationItem>
                            );
                        }
                        if (link.label === '...') {
                            return (
                                <PaginationItem key={key}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        return (
                            <PaginationItem key={key}>
                                <PaginationLink
                                    isActive={link.active}
                                    render={
                                        link.url ? (
                                            <Link href={link.url} />
                                        ) : (
                                            <span />
                                        )
                                    }
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })
                ) : (
                    <>
                        <PaginationItem>
                            <PaginationPrevious
                                render={
                                    links.prev ? (
                                        <Link href={links.prev} />
                                    ) : (
                                        <span />
                                    )
                                }
                                aria-disabled={!links.prev}
                                tabIndex={!links.prev ? -1 : undefined}
                                className={
                                    !links.prev
                                        ? 'pointer-events-none opacity-50'
                                        : undefined
                                }
                            />
                        </PaginationItem>
                        {showPageInfo &&
                            typeof currentPage === 'number' &&
                            typeof lastPage === 'number' && (
                                <PaginationItem>
                                    <span className="px-2 text-sm text-muted-foreground">
                                        Page {currentPage} of {lastPage}
                                    </span>
                                </PaginationItem>
                            )}
                        <PaginationItem>
                            <PaginationNext
                                render={
                                    links.next ? (
                                        <Link href={links.next} />
                                    ) : (
                                        <span />
                                    )
                                }
                                aria-disabled={!links.next}
                                tabIndex={!links.next ? -1 : undefined}
                                className={
                                    !links.next
                                        ? 'pointer-events-none opacity-50'
                                        : undefined
                                }
                            />
                        </PaginationItem>
                    </>
                )}
            </PaginationContent>
        </BasePagination>
    );
}

interface PaginationData {
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLinksData;
    current_page: number;
    last_page: number;
}

interface PaginationProps {
    data: PaginationData;
    showCount?: boolean;
    countLabel?: string;
    showPerPage?: boolean;
    perPage?: string;
    onPerPageChange?: (value: string) => void;
    perPageOptions?: string[];
    defaultPerPageLabel?: string;
    showPageInfo?: boolean;
    className?: string;
}

export function Pagination({
    data,
    showCount = true,
    countLabel = 'Data',
    showPerPage = true,
    perPage,
    onPerPageChange,
    perPageOptions = ['5', '10', '20', '50', '100'],
    defaultPerPageLabel = '10',
    showPageInfo = false,
    className,
}: PaginationProps) {
    const shouldShowPerPage = showPerPage && !!onPerPageChange;
    const displayPerPage = perPage ?? defaultPerPageLabel;
    const fromValue = data.from ?? 0;
    const toValue = data.to ?? 0;

    return (
        <div
            className={cn(
                'flex items-center gap-4',
                showCount ? 'justify-between' : 'justify-end',
                className,
            )}
        >
            {showCount && (
                <div className="text-sm text-muted-foreground">
                    Showing {fromValue} to {toValue} of {data.total}{' '}
                    {countLabel}
                </div>
            )}
            {shouldShowPerPage && (
                <Select
                    value={displayPerPage}
                    onValueChange={(value) =>
                        onPerPageChange?.(value || defaultPerPageLabel)
                    }
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue>
                            {displayPerPage
                                ? `${displayPerPage} per page`
                                : `${defaultPerPageLabel} per page`}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((value) => (
                            <SelectItem key={value} value={value}>
                                {value} per page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            <PaginationLinks
                className="w-auto"
                links={data.links}
                currentPage={data.current_page}
                lastPage={data.last_page}
                showPageInfo={showPageInfo}
            />
        </div>
    );
}
