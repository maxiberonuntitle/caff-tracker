'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FloatingActionButtonProps = {
  onClick: () => void;
};

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-50 bg-green-500/80 hover:bg-green-500/90"
      aria-label="Nueva Consulta"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}

    
