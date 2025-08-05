'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
  backUrl?: string;
};

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  action, 
  onAction, 
  actionLabel, 
  actionIcon: ActionIcon,
  showBackButton = false, 
  backUrl 
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  // Renderizar el botón de acción
  const renderAction = () => {
    if (action) {
      return action;
    }
    
    if (onAction && actionLabel) {
      return (
        <Button onClick={onAction} className="flex items-center gap-2">
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {actionLabel}
        </Button>
      );
    }
    
    return null;
  };

  return (
    <div className="relative mb-8 pt-4 md:pt-0">
      {/* Botón Volver - Posición absoluta a la izquierda */}
      {showBackButton && (
        <div className="absolute left-0 top-0 z-10 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </div>
      )}
      
      {/* Título centrado en el medio con espacio */}
      <div className="text-center px-16 md:px-20 lg:px-24 pt-12 md:pt-0">
        <div className="flex items-center justify-center gap-2 mb-2">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <h1 className="text-2xl md:text-2xl lg:text-2xl font-bold tracking-tight font-headline text-gray-900">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-gray-600 text-sm md:text-base mb-2">{subtitle}</p>
        )}
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4 rounded-full"></div>
      </div>
      
      {/* Botón de acción - Posición absoluta a la derecha */}
      {renderAction() && (
        <div className="absolute right-0 top-0 z-10 p-2">
          {renderAction()}
        </div>
      )}
    </div>
  );
}
