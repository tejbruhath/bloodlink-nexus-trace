
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn('animate-spin text-muted-foreground', className)} 
      size={size} 
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <LoadingSpinner size={48} className="text-bloodlink-red mb-4" />
      <p className="text-muted-foreground">Loading data...</p>
    </div>
  );
}
