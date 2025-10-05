// Color coding system for class types and statuses
export const ClassColorScheme = {
  // Class type colors - luxury gradient combinations
  types: {
    fitness: {
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      border: 'border-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accent: '#10b981'
    },
    private: {
      bg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      border: 'border-purple-500',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      accent: '#8b5cf6'
    },
    yoga: {
      bg: 'bg-gradient-to-r from-rose-500 to-pink-600',
      border: 'border-rose-500',
      text: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      accent: '#f43f5e'
    },
    pilates: {
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      border: 'border-blue-500',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      accent: '#3b82f6'
    },
    barre: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      border: 'border-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      accent: '#f59e0b'
    },
    cardio: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      border: 'border-red-500',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-200',
      accent: '#ef4444'
    },
    strength: {
      bg: 'bg-gradient-to-r from-gray-700 to-slate-800',
      border: 'border-gray-700',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800 border-gray-200',
      accent: '#374151'
    }
  },
  
  // Status colors
  status: {
    upcoming: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      accent: '#3b82f6'
    },
    inProgress: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-800',
      accent: '#10b981'
    },
    completed: {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      accent: '#6b7280'
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-800',
      accent: '#ef4444'
    }
  },
  
  // Capacity indicators
  capacity: {
    low: { color: '#10b981', bg: 'bg-green-500' },      // 0-60%
    medium: { color: '#f59e0b', bg: 'bg-amber-500' },   // 60-85%
    high: { color: '#ef4444', bg: 'bg-red-500' },       // 85-100%
    full: { color: '#dc2626', bg: 'bg-red-600' }        // 100%+
  }
};

export function getClassColor(type: string, variant: 'bg' | 'border' | 'text' | 'badge' | 'accent' = 'bg') {
  const normalizedType = type.toLowerCase();
  const colorScheme = ClassColorScheme.types[normalizedType as keyof typeof ClassColorScheme.types];
  
  return colorScheme ? colorScheme[variant] : ClassColorScheme.types.fitness[variant];
}

export function getStatusColor(status: string, variant: 'bg' | 'border' | 'text' | 'accent' = 'bg') {
  const colorScheme = ClassColorScheme.status[status as keyof typeof ClassColorScheme.status];
  
  return colorScheme ? colorScheme[variant] : ClassColorScheme.status.upcoming[variant];
}

export function getCapacityColor(bookingCount: number, capacity: number) {
  const percentage = (bookingCount / capacity) * 100;
  
  if (percentage >= 100) return ClassColorScheme.capacity.full;
  if (percentage >= 85) return ClassColorScheme.capacity.high;
  if (percentage >= 60) return ClassColorScheme.capacity.medium;
  return ClassColorScheme.capacity.low;
}

export function getTimeSlotColor(hour: number) {
  // Morning (6-11): Cool blues/teals
  if (hour >= 6 && hour < 12) return 'bg-gradient-to-r from-blue-100 to-teal-100 border-blue-200';
  // Afternoon (12-17): Warm oranges/ambers  
  if (hour >= 12 && hour < 18) return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200';
  // Evening (18-22): Deep purples/indigos
  return 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200';
}