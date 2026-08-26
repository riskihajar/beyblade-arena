'use client';

import { Button } from '@/components/ui/button';
import {
    Menu,
    MenuGroup,
    MenuItem,
    MenuPopup,
    MenuTrigger,
} from '@/components/ui/menu';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';

type ExportFormat = 'xlsx' | 'csv' | 'json';

interface ExportDropdownProps {
    getExportUrl: (format: ExportFormat) => string;
    label?: string;
}

export function ExportDropdown({
    getExportUrl,
    label = 'Export',
}: ExportDropdownProps) {
    const formats: {
        id: ExportFormat;
        label: string;
        icon: typeof FileSpreadsheet;
    }[] = [
        { id: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
        { id: 'csv', label: 'CSV (.csv)', icon: FileText },
        { id: 'json', label: 'JSON (.json)', icon: FileJson },
    ];

    const handleExport = (format: ExportFormat) => {
        const url = getExportUrl(format);
        window.open(url, '_blank');
    };

    return (
        <Menu>
            <MenuTrigger
                render={
                    <Button variant="outline">
                        <Download className="mr-2 size-4" />
                        {label}
                    </Button>
                }
            />
            <MenuPopup align="end">
                <MenuGroup>
                    {formats.map((format) => (
                        <MenuItem
                            key={format.id}
                            onClick={() => handleExport(format.id)}
                        >
                            <format.icon className="mr-2 size-4" />
                            {format.label}
                        </MenuItem>
                    ))}
                </MenuGroup>
            </MenuPopup>
        </Menu>
    );
}
