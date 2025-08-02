'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { LayoutDashboard, ClipboardList, HeartPulse, PlusCircle, Info } from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/consultas', label: 'Consultas medicas', icon: ClipboardList },
  { href: '/como-funciona', label: '¿Cómo funciona?', icon: Info },
];

type SidebarNavProps = {
    onNewConsulta: () => void;
}

export function SidebarNav({ onNewConsulta }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="size-5" />
            </div>
            <span className="font-semibold text-lg font-headline">CAFF Consultas</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           <SidebarSeparator className="my-1" />
           <SidebarMenuItem>
             <SidebarMenuButton
                onClick={onNewConsulta}
                tooltip={{ children: 'Nueva Consulta', side: 'right' }}
             >
                <PlusCircle />
                <span>Nueva Consulta</span>
             </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </>
  );
}
