import React from 'react';
import { Globe } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}

export default function EmptyState({
  title,
  description,
  action,
  icon: Icon = Globe,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mb-4">
        <Icon size={22} className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}