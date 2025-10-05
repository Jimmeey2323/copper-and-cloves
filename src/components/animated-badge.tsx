import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnimatedBadgeProps {
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'available' | 'full' | 'waitlist';
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBadge({ status, children, className }: AnimatedBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-sm hover:shadow-md transition-all duration-300';
      case 'in-progress':
        return 'bg-gradient-to-r from-green-700 to-emerald-900 text-white animate-slow-pulse shadow-sm hover:shadow-md transition-all duration-300';
      case 'completed':
        return 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-sm hover:shadow-md transition-all duration-300';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-700 to-red-900 text-white animate-slow-pulse shadow-sm hover:shadow-md transition-all duration-300';
      case 'available':
        return 'bg-gradient-to-r from-emerald-400 to-green-900 text-white animate-slow-pulse shadow-sm hover:shadow-md transition-all duration-300';
      case 'full':
        return 'bg-gradient-to-r from-orange-700 to-red-900 text-white shadow-sm hover:shadow-md transition-all duration-300';
      case 'waitlist':
        return 'bg-gradient-to-r from-yellow-400 to-orange-900 text-white animate-slow-pulse shadow-sm hover:shadow-md transition-all duration-300';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-900 text-white';
    }
  };

  return (
    <Badge className={cn(
      'border-0 font-semibold px-3 py-1 text-xs uppercase tracking-wide',
      getStatusStyles(status),
      className
    )}>
      {children}
    </Badge>
  );
}

// Premium status indicator with glow effect
export function StatusIndicator({ status, size = 'sm' }: { 
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-700 shadow-blue-700/50 animate-slow-pulse';
      case 'in-progress':
        return 'bg-green-700 shadow-green-700/50 animate-ping';
      case 'completed':
        return 'bg-gray-400 shadow-gray-400/50';
      case 'cancelled':
        return 'bg-red-700 shadow-red-700/50 animate-slow-pulse';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className={cn(
      'rounded-full shadow-lg',
      sizeClasses[size],
      getStatusColor(status)
    )}></div>
  );
}
