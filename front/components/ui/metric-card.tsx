'use client';

import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  variant?: 'primary' | 'secondary' | 'muted';
  staggerIndex?: number;
}

export function MetricCard({ icon: Icon, value, label, variant = 'primary', staggerIndex = 0 }: MetricCardProps) {
  const valueColors = {
    primary: 'text-primary',
    secondary: 'text-accent',
    muted: 'text-foreground',
  };

  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-xl p-4 md:p-5 animate-fade-in-up opacity-0",
        staggerIndex === 0 && "stagger-1",
        staggerIndex === 1 && "stagger-2",
        staggerIndex === 2 && "stagger-3"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className={cn("text-2xl md:text-3xl font-heading font-bold", valueColors[variant])}>
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
