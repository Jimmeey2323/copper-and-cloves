interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'luxury' | 'pulse';
}

export function LoadingSpinner({ size = 'md', className = '', variant = 'luxury' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  if (variant === 'luxury') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-blue-400 via-purple-500 to-blue-600 animate-spin"></div>
        {/* Middle ring */}
        <div className="absolute inset-1 rounded-full border-2 border-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-spin-reverse"></div>
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping"></div>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-gradient-to-r border-t-from-blue-600 border-t-to-purple-600"></div>
    </div>
  );
}