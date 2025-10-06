

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function Physique57Logo({ size = 'md', animated = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const animationClasses = animated 
    ? 'animate-logo-float hover:animate-logo-glow transition-all duration-500 hover:scale-110 hover:rotate-3' 
    : 'transition-all duration-300 hover:scale-105';

  return (
    <div className={`relative group ${className}`}>
      <img 
        src="/physique57-logo.svg" 
        alt="Physique 57 Logo" 
        className={`${sizeClasses[size]} ${animationClasses} drop-shadow-lg`}
        onError={(e) => {
          // Fallback to text logo if SVG fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      {/* Fallback text logo */}
      <div 
        className={`${sizeClasses[size]} ${animationClasses} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg hidden`}
        style={{ display: 'none' }}
      >
        <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}>
          P57
        </span>
      </div>
      
      {/* Animated background effects */}
      {animated && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
        </>
      )}
    </div>
  );
}