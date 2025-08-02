'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ExpandableTextProps = {
  text?: string;
  maxLength?: number;
};

export function ExpandableText({ text, maxLength = 50 }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return <span className="text-muted-foreground">-</span>;
  }

  const isLongText = text.length > maxLength;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="max-w-xs">
        {isLongText && !isExpanded ? (
            <p className="text-xs">
            {`${text.substring(0, maxLength)}... `}
            <Button variant="link" size="sm" onClick={toggleExpanded} className="text-xs h-auto p-0">
                Ver más
            </Button>
            </p>
        ) : (
            <p className="text-xs whitespace-pre-wrap">
            {text}
            {isLongText && (
                <Button variant="link" size="sm" onClick={toggleExpanded} className="ml-1 text-xs h-auto p-0">
                Ver menos
                </Button>
            )}
            </p>
        )}
    </div>
  );
}
