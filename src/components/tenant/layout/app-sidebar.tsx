'use client';

import { NavMain } from '@/components/tenant/layout/nav-main';
import { NavSecondary } from '@/components/tenant/layout/nav-secondary';
import { NavUser } from '@/components/tenant/layout/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { userType } from '@/types/user';
import {
  Building2,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Users
} from 'lucide-react';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: userType;
  slug: string;
  orgName: string;
}

export function AppSidebar({ user, slug, orgName, ...props }: AppSidebarProps) {
  const navMain = [
    { title: 'Overview', url: `/tenant/${slug}`, icon: LayoutDashboard },
    { title: 'Members', url: `/tenant/${slug}/members`, icon: Users },
    { title: 'Settings', url: `/tenant/${slug}/settings`, icon: Settings }
  ];

  const navSecondary = [{ title: 'Get Help', url: '#', icon: HelpCircle }];

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <Link
                href={`/tenant/${slug}`}
                className='flex items-center gap-2'
              >
                <Building2 className='size-5!' />
                <span className='truncate text-base font-semibold'>
                  {orgName}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
