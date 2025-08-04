'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard, ClipboardList, Plus, PlusCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ContentContainer } from './ContentContainer';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/consultas', label: 'Gestión de Consultas', icon: ClipboardList },
  { href: '/como-funciona', label: '¿Cómo funciona?', icon: Info },
];

type NavbarProps = {
  onNewConsulta: () => void;
}

export function Navbar({ onNewConsulta }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
             {/* Navbar principal */}
                                               <nav className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
          isScrolled 
            ? "bg-white/98 backdrop-blur-lg shadow-xl border-b border-gray-200/50 py-2" 
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
                    CAFF
                  </h1>
                 <p className={cn(
                   "text-xs transition-all duration-300",
                   isScrolled ? "text-gray-600" : "text-white/90"
                 )}>
                   Gestión de Consultas
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
               
               

               <Button
                 onClick={onNewConsulta}
                 className={cn(
                   "flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg text-sm",
                   isScrolled
                     ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                     : "bg-white/95 hover:bg-white text-gray-900 shadow-xl"
                 )}
               >
                 <PlusCircle className="size-4" />
                 Nueva Consulta
               </Button>
             </div>



                         {/* Botón hamburguesa */}
                         <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                                className={cn(
                   "lg:hidden transition-all duration-300 p-2",
                   isScrolled
                     ? "text-gray-700 hover:bg-gray-100"
                     : "text-white hover:bg-white/20"
                 )}
              >
                {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
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
               
               <Button
                 onClick={() => {
                   onNewConsulta();
                   closeMobileMenu();
                 }}
                 className={cn(
                   "flex items-center gap-3 p-4 h-auto border-0 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-102 text-sm",
                   isScrolled
                     ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                     : "bg-white/95 hover:bg-white text-gray-900 shadow-xl"
                 )}
               >
                 <PlusCircle className="size-4" />
                 <span className="font-medium">Nueva Consulta</span>
               </Button>
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