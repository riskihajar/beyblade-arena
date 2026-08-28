import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as eventsIndex } from '@/routes/admin/events';
import { index as rulesetsIndex } from '@/routes/admin/rulesets';
import { index as seasonsIndex } from '@/routes/admin/seasons';
import settings from '@/routes/settings';
import { type Auth } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    Layers,
    LayoutGrid,
    Megaphone,
    ScrollText,
    Shield,
    Trophy,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const hasAdminAccess = auth.permissions?.includes('admin.access');
    const canManageTournaments =
        hasAdminAccess ||
        auth.permissions?.includes('tournament.view') ||
        auth.permissions?.includes('tournament.create');
    const page = usePage();

    const isActive = (href: string) =>
        page.url === href || page.url.startsWith(`${href}/`);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={page.url === '/dashboard'}
                                tooltip={{ children: 'Dashboard' }}
                                render={
                                    <Link href={dashboard()} prefetch>
                                        <LayoutGrid className="size-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                }
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {canManageTournaments && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Turnamen</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/admin/events')}
                                    tooltip={{
                                        children: 'Turnamen & Event',
                                    }}
                                    render={
                                        <Link href={eventsIndex().url} prefetch>
                                            <Trophy className="size-4" />
                                            <span>Turnamen & Event</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/admin/checkin')}
                                    tooltip={{
                                        children: 'Fast Check-in Venue',
                                    }}
                                    render={
                                        <Link href="/admin/checkin" prefetch>
                                            <UserCheck className="size-4" />
                                            <span>Fast Check-in</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/admin/registrations')}
                                    tooltip={{ children: 'Daftar Peserta' }}
                                    render={
                                        <Link
                                            href="/admin/registrations"
                                            prefetch
                                        >
                                            <Users className="size-4" />
                                            <span>Daftar Peserta</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/admin/stadiums')}
                                    tooltip={{
                                        children: 'Arena & Panggilan',
                                    }}
                                    render={
                                        <Link href="/admin/stadiums" prefetch>
                                            <Megaphone className="size-4" />
                                            <span>Arena & Panggilan</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/judge/console')}
                                    tooltip={{
                                        children: 'Konsol Wasit & Juri',
                                    }}
                                    render={
                                        <Link href="/judge/console" prefetch>
                                            <Shield className="size-4" />
                                            <span>Konsol Wasit & Juri</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/admin/rulesets')}
                                    tooltip={{
                                        children: 'Ruleset Scoring',
                                    }}
                                    render={
                                        <Link
                                            href={rulesetsIndex().url}
                                            prefetch
                                        >
                                            <Layers className="size-4" />
                                            <span>Ruleset Scoring</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={isActive('/admin/seasons')}
                                    tooltip={{
                                        children: 'Musim Kompetisi',
                                    }}
                                    render={
                                        <Link
                                            href={seasonsIndex().url}
                                            prefetch
                                        >
                                            <Calendar className="size-4" />
                                            <span>Musim Kompetisi</span>
                                        </Link>
                                    }
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {hasAdminAccess && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isActive('/settings/users')}
                                        tooltip={{ children: 'Users' }}
                                        render={
                                            <Link
                                                href={
                                                    settings.users.index().url
                                                }
                                                prefetch
                                            >
                                                <Users className="size-4" />
                                                <span>Users</span>
                                            </Link>
                                        }
                                    />
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isActive('/settings/roles')}
                                        tooltip={{ children: 'Roles' }}
                                        render={
                                            <Link
                                                href={
                                                    settings.roles.index().url
                                                }
                                                prefetch
                                            >
                                                <Shield className="size-4" />
                                                <span>Roles</span>
                                            </Link>
                                        }
                                    />
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isActive(
                                            '/settings/activities',
                                        )}
                                        tooltip={{
                                            children: 'Activities',
                                        }}
                                        render={
                                            <Link
                                                href={
                                                    settings.activities.index()
                                                        .url
                                                }
                                                prefetch
                                            >
                                                <ScrollText className="size-4" />
                                                <span>Activities</span>
                                            </Link>
                                        }
                                    />
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>{auth.user && <NavUser />}</SidebarFooter>
        </Sidebar>
    );
}
