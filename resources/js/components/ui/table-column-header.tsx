import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Column, RowData } from '@tanstack/react-table';

interface TableColumnHeaderProps<TData extends RowData, TValue> {
    column: Column<TData, TValue>;
    title: string;
    sort?: string | null;
    direction?: string | null;
}

export function TableColumnHeader<TData extends RowData, TValue>({
    column,
    title,
    sort,
    direction,
}: TableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <span className="font-medium">{title}</span>;
    }

    const columnId = String(column.id);
    const tableSort = column.getIsSorted(); // 'asc' | 'desc' | false
    const sortFromTable = tableSort || null;
    const sortFromFilters = sort === columnId ? direction ?? null : null;
    const effectiveSort = sortFromTable ?? sortFromFilters;
    const nextDesc = effectiveSort ? effectiveSort === 'asc' : false;

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn(
                'h-8 px-0',
                effectiveSort ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
            onClick={() => column.toggleSorting(nextDesc)}
        >
            {title}
            {effectiveSort === 'asc' && (
                <ChevronUp className="ml-2 h-4 w-4" />
            )}
            {effectiveSort === 'desc' && (
                <ChevronDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    );
}
