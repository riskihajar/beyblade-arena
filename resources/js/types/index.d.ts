import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: string;
    data: {
        message: string;
        type: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Auth {
    user: User;
    permissions: string[];
    notifications?: Notification[];
    unreadCount?: number;
    chats?: ChatConversation[];
    chats_total?: number;
}

export interface ChatConversation {
    id: string;
    title: string;
    updated_at: string;
    provider?: string | null;
    model?: string | null;
}

export interface ChatAttachment {
    id: string;
    type: 'image' | 'document';
    name: string;
    mime_type: string;
    size: number;
    storage_driver: string;
    provider_file_id?: string | null;
    storage_path?: string | null;
    url?: string | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface GlobalSearchItem {
    label: string;
    href: string;
    keywords: string[];
}

export interface GlobalSearchGroup {
    label: string;
    items: GlobalSearchItem[];
}

export interface GlobalSearchData {
    groups: GlobalSearchGroup[];
}

export interface GlobalSearchResult {
    id: string;
    label: string;
    description: string;
    href: string;
}

export interface GlobalSearchResultGroup {
    type: string;
    label: string;
    items: GlobalSearchResult[];
}

export interface GlobalSearchResponse {
    results: GlobalSearchResultGroup[];
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Activity {
    id: string;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: string | null;
    causer_type: string | null;
    causer_id: string | null;
    properties: object | null;
    created_at: string;
    updated_at: string;
    causer?: {
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
    } | null;
    subject?: {
        id: string;
        [key: string]: unknown;
    } | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    globalSearch: GlobalSearchData;
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    [key: string]: unknown;
}

export interface Role {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
    users_count?: number;
}

export interface Permission {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    [key: string]: unknown;
}

export interface UserGrowthData {
    date: string;
    count: number;
}

export interface RoleDistribution {
    name: string;
    count: number;
}

export interface PaginatedData<T> {
    data: T[];
    links:
        | {
              first: string | null;
              last: string | null;
              prev: string | null;
              next: string | null;
          }
        | Array<{ url: string | null; label: string; active: boolean }>;
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}
