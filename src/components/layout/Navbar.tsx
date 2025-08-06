'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard, ClipboardList, Plus, PlusCircle, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ContentContainer } from './ContentContainer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/consultas', label: 'Consultas médicas', icon: ClipboardList },
  { href: '/sna', label: 'SNAs', icon: AlertTriangle },
  { href: '/como-funciona', label: '¿Cómo funciona?', icon: Info },
];

type NavbarProps = {
  onNewConsulta: () => void;
  onNewSNA?: () => void;
}

export function Navbar({ onNewConsulta, onNewSNA }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determinar si estamos en la página de SNAs
  const isSNAPage = pathname === '/sna';

  // Efecto para detectar scroll con throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 10); // Más sensible al scroll
          ticking = false;
        });
        ticking = true;
      }
    };

    // Establecer estado inicial
    setIsScrolled(window.scrollY > 10);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Función para navegar rápidamente
  const quickNavigate = (path: string) => {
    router.push(path);
    closeMobileMenu();
  };

  return (
    <>
             {/* Navbar principal */}
                                               <nav className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
          isScrolled 
            ? "bg-white/98 backdrop-blur-lg shadow-xl border-b border-gray-200/50 py-2" 
            : isSNAPage
              ? "bg-gradient-to-r from-orange-500/90 to-amber-500/90 backdrop-blur-lg shadow-xl py-3"
              : "bg-primary/90 backdrop-blur-lg shadow-xl py-3"
        )}>
         <ContentContainer>
           <div className="flex items-center justify-between">
             {/* Logo y título */}
             <Link href="/" className="flex items-center gap-3 group">
                                                               <div className={cn(
                   "flex items-center justify-center rounded-lg transition-all duration-500 ease-in-out hover:scale-110",
                   isScrolled 
                     ? "size-8 bg-primary text-primary-foreground shadow-lg" 
                     : "size-10 bg-white/95 text-blue-600 shadow-xl"
                 )}>
                                    <Plus className={cn(
                     "transition-all duration-500 ease-in-out",
                     isScrolled ? "size-4" : "size-5 stroke-[2.5]"
                   )} />
               </div>
                                                               <div className="block">
                                     <h1 className={cn(
                      "font-semibold transition-all duration-300",
                      isScrolled ? "text-base text-gray-900" : "text-lg text-white drop-shadow-lg"
                    )}>
                                             Centro CAFF
                    </h1>
                   <p className={cn(
                     "text-xs transition-all duration-300",
                     isScrolled ? "text-gray-600" : "text-white/90"
                   )}>
                     Gestión Integral
                   </p>
                 </div>
             </Link>

                         {/* Navegación desktop */}
             <div className="hidden lg:flex items-center gap-4">
               {menuItems.map(item => (
                 <Link
                   key={item.href}
                   href={item.href}
                   className={cn(
                     "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 text-sm",
                     pathname === item.href
                       ? isScrolled 
                         ? "bg-primary/10 text-primary shadow-md" 
                         : "bg-white/20 text-white shadow-lg"
                       : isScrolled
                         ? "text-gray-700 hover:text-primary hover:bg-gray-50 hover:shadow-md"
                         : "text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg"
                   )}
                 >
                   <item.icon className="size-4" />
                   {item.label}
                 </Link>
               ))}
               
               

               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button
                     className={cn(
                       "flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg text-sm rounded-full",
                       isScrolled
                         ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white size-10"
                         : "bg-white/95 hover:bg-white text-gray-900 shadow-xl size-10"
                     )}
                   >
                     <Plus className="size-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuItem onClick={onNewConsulta} className="cursor-pointer">
                     <ClipboardList className="mr-2 h-4 w-4" />
                     Nueva Consulta
                   </DropdownMenuItem>
                   {onNewSNA && (
                     <DropdownMenuItem onClick={onNewSNA} className="cursor-pointer">
                       <AlertTriangle className="mr-2 h-4 w-4" />
                       Nuevo SNA
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>

             {/* Controles móviles */}
             <div className="flex items-center gap-2 lg:hidden">
               {/* Toggle de navegación rápida */}
               <div className={cn(
                 "flex items-center rounded-full p-1 transition-all duration-300",
                 isScrolled
                   ? "bg-gray-100 border border-gray-200"
                   : "bg-white/20 border border-white/30"
               )}>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => quickNavigate('/consultas')}
                   className={cn(
                     "h-7 px-2 text-xs font-medium transition-all duration-300 rounded-full",
                     pathname === '/consultas'
                       ? isScrolled
                         ? "bg-primary text-white shadow-sm"
                         : "bg-white/90 text-gray-900 shadow-sm"
                       : isScrolled
                         ? "text-gray-600 hover:text-primary hover:bg-gray-50"
                         : "text-white/80 hover:text-white hover:bg-white/10"
                   )}
                 >
                   <ClipboardList className="size-3" />
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => quickNavigate('/sna')}
                   className={cn(
                     "h-7 px-2 text-xs font-medium transition-all duration-300 rounded-full",
                     pathname === '/sna'
                       ? isScrolled
                         ? "bg-primary text-white shadow-sm"
                         : isSNAPage
                           ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-sm"
                           : "bg-white/90 text-gray-900 shadow-sm"
                       : isScrolled
                         ? "text-gray-600 hover:text-primary hover:bg-gray-50"
                         : "text-white/80 hover:text-white hover:bg-white/10"
                   )}
                 >
                   <AlertTriangle className={cn(
                     "size-3",
                     pathname === '/sna' && !isScrolled && isSNAPage && "text-orange-100"
                   )} />
                 </Button>
               </div>

               {/* Botón hamburguesa */}
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={toggleMobileMenu}
                 className={cn(
                   "transition-all duration-300 p-2",
                   isScrolled
                     ? "text-gray-700 hover:bg-gray-100"
                     : "text-white hover:bg-white/20"
                 )}
               >
                 {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
               </Button>
             </div>
           </div>
         </ContentContainer>

         {/* Menú móvil integrado en el navbar */}
         <div className={cn(
           "lg:hidden transition-all duration-300 ease-in-out overflow-hidden",
           isScrolled 
             ? "border-t border-gray-200/50" 
             : "border-t border-white/20",
           isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
         )}>
           <ContentContainer className="py-6">
             {/* Enlaces del menú móvil */}
             <div className="grid grid-cols-1 gap-3">
               {menuItems.map(item => (
                 <Link
                   key={item.href}
                   href={item.href}
                   onClick={closeMobileMenu}
                   className={cn(
                     "flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md hover:scale-102",
                     pathname === item.href
                       ? isScrolled
                         ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                         : "bg-white/25 border-white/40 text-white shadow-lg backdrop-blur-sm"
                       : isScrolled
                         ? "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                         : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 text-white/90 hover:text-white"
                   )}
                 >
                   <item.icon className={cn(
                     "size-4",
                     pathname === item.href && !isScrolled && "text-white"
                   )} />
                   <span className={cn(
                     "font-medium text-sm",
                     pathname === item.href && !isScrolled && "text-white font-semibold"
                   )}>{item.label}</span>
                 </Link>
               ))}
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button
                     className={cn(
                       "flex items-center justify-center gap-3 p-4 h-auto border-0 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-102 text-sm",
                       isScrolled
                         ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                         : "bg-white/95 hover:bg-white text-gray-900 shadow-xl"
                     )}
                   >
                     <Plus className="size-4" />
                     <span className="font-medium">Nuevo</span>
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuItem 
                     onClick={() => {
                       onNewConsulta();
                       closeMobileMenu();
                     }} 
                     className="cursor-pointer"
                   >
                     <ClipboardList className="mr-2 h-4 w-4" />
                     Nueva Consulta
                   </DropdownMenuItem>
                   {onNewSNA && (
                     <DropdownMenuItem 
                       onClick={() => {
                         onNewSNA();
                         closeMobileMenu();
                       }} 
                       className="cursor-pointer"
                     >
                       <AlertTriangle className="mr-2 h-4 w-4" />
                       Nuevo SNA
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           </ContentContainer>
         </div>
       </nav>

                                                            {/* Espaciador para el contenido */}
          <div className={cn(
            "transition-all duration-300",
            isScrolled ? "h-6 lg:h-8" : "h-10 lg:h-12"
          )} />
     </>
   );
} 