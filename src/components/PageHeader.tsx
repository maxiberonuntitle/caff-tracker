import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-6 gap-4">
      <div className="w-full text-center md:text-left">
        <h1 className="text-lg md:text-xl font-bold tracking-tight font-headline text-center md:text-left">{title}</h1>
      </div>
      <div className="w-full md:w-auto flex justify-center md:justify-end">
        {action}
      </div>
    </div>
  );
}
