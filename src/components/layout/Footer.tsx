'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  Users, 
  Heart,
  Zap
} from 'lucide-react';

export function Footer() {
  const router = useRouter();

  const quickLinks = [
    {
      icon: <Home className="h-4 w-4" />,
      label: 'Inicio',
      href: '/',
      description: 'Vista general del sistema'
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Consultas',
      href: '/consultas',
      description: 'Gestión de consultas médicas'
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Cómo Funciona',
      href: '/como-funciona',
      description: 'Guía de uso del sistema'
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-slate-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Logo y Descripción */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
                             <h3 className="text-xl font-bold text-gray-900">Gestión de Consultas Médicas</h3>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Enlaces Rápidos
            </h4>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-auto p-2"
                  onClick={() => handleNavigation(link.href)}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <div className="text-left">
                      <div className="font-medium">{link.label}</div>
                      <div className="text-xs text-gray-500">{link.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                         <div className="text-sm text-gray-500">
               © 2025 Gestión de Consultas Médicas. Todos los derechos reservados.
             </div>
            <div className="text-sm text-gray-500">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 