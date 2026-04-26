import { useState, useEffect, useRef } from "react";

// Animated Counter Component with optimized performance
function AnimatedCounter({ 
  value, 
  duration = 800, 
  prefix = "", 
  suffix = "",
  delay = 0 
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const counterRef = useRef(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  // Animate count with easing (respects reduced motion)
  useEffect(() => {
    if (!isVisible) return;

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      const numericValue = typeof value === 'string' 
        ? parseInt(value.replace(/[^0-9]/g, ''), 10) 
        : Number(value) || 0;
      setCount(numericValue);
      return;
    }

    const startTime = performance.now();
    const numericValue = typeof value === 'string' 
      ? parseInt(value.replace(/[^0-9]/g, ''), 10) 
      : Number(value) || 0;

    // Don't animate small numbers - too distracting
    if (numericValue < 10) {
      setCount(numericValue);
      return;
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * numericValue);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, isVisible, prefersReducedMotion]);

  // Format with thousands separator
  const formattedCount = count.toLocaleString();

  return (
    <span 
      ref={counterRef} 
      className="tabular-nums tracking-tight"
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}{formattedCount}{suffix}
    </span>
  );
}

// Trend Indicator Component
function TrendIndicator({ trend, direction = "up", label = "vs last month" }) {
  if (trend === undefined || trend === null) return null;

  const isPositive = direction === "up";
  const trendColor = isPositive 
    ? "text-emerald-600 bg-emerald-50" 
    : "text-rose-600 bg-rose-50";
  const iconRotation = isPositive ? "" : "rotate-180";

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${trendColor}`}
      aria-label={`${isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(trend)}% ${label}`}
    >
      <svg 
        className={`w-3.5 h-3.5 ${iconRotation}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
      <span>
        {isPositive ? "+" : ""}{trend}% {label}
      </span>
    </div>
  );
}

// Loading Skeleton Component
function CardSkeleton() {
  return (
    <div 
      className="relative h-full glass-card rounded-3xl p-6 overflow-hidden"
      aria-hidden="true"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-white to-gray-100 animate-shimmer" />
      
      <div className="relative space-y-4">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        
        {/* Trend skeleton */}
        <div className="h-6 w-28 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// Color configuration
const colorMap = {
  sky: {
    gradient: "from-sky-400/20 via-sky-100/10 to-transparent",
    iconBg: "bg-sky-100/80",
    iconText: "text-sky-600",
    accent: "from-sky-400 to-sky-500",
    glow: "shadow-sky-500/10",
  },
  emerald: {
    gradient: "from-emerald-400/20 via-emerald-100/10 to-transparent",
    iconBg: "bg-emerald-100/80",
    iconText: "text-emerald-600",
    accent: "from-emerald-400 to-emerald-500",
    glow: "shadow-emerald-500/10",
  },
  violet: {
    gradient: "from-violet-400/20 via-violet-100/10 to-transparent",
    iconBg: "bg-violet-100/80",
    iconText: "text-violet-600",
    accent: "from-violet-400 to-violet-500",
    glow: "shadow-violet-500/10",
  },
  amber: {
    gradient: "from-amber-400/20 via-amber-100/10 to-transparent",
    iconBg: "bg-amber-100/80",
    iconText: "text-amber-600",
    accent: "from-amber-400 to-amber-500",
    glow: "shadow-amber-500/10",
  },
  gold: {
    gradient: "from-amber-400/20 via-amber-100/10 to-transparent",
    iconBg: "bg-amber-100/80",
    iconText: "text-amber-700",
    accent: "from-amber-500 to-amber-600",
    glow: "shadow-amber-500/10",
  },
};

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendDirection = "up",
  trendLabel = "vs last month",
  onClick, 
  color = "sky",
  animateValue = true,
  className = "",
  loading = false,
  "aria-label": ariaLabel
}) {
  const colors = colorMap[color] || colorMap.sky;

  // Generate staggered animation delay based on color index
  const colorOrder = { sky: 0, emerald: 1, violet: 2, amber: 3, gold: 4 };
  const staggerDelay = (colorOrder[color] || 0) * 100; // 0ms, 100ms, 200ms...

  // Card container with hover effects
  const CardWrapper = ({ children, showWrapper = true }) => {
    const cardClasses = `
      group relative h-full
      glass-card rounded-3xl p-6
      hover-elevation transition-smooth
      ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500' : ''}
      ${className}
    `;

    if (showWrapper && onClick) {
      return (
        <div
          className={cardClasses}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick?.();
            }
          }}
          aria-label={ariaLabel || `View ${title} details`}
        >
          {children}
        </div>
      );
    }

    return (
      <div className={cardClasses} aria-label={ariaLabel || title}>
        {children}
      </div>
    );
  };

  // Render loading skeleton
  if (loading) {
    return (
      <CardWrapper showWrapper={false}>
        <CardSkeleton />
      </CardWrapper>
    );
  }

  // Format value for display
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString() 
    : value;

  return (
    <CardWrapper>
      {/* Content */}
      <div className="relative z-10">
        {/* Header: icon + title */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">
              {title}
            </p>
            
            {/* Value with animated counter */}
            <div className="mt-3">
              {animateValue && typeof value === 'number' ? (
                <AnimatedCounter 
                  value={value} 
                  duration={800}
                  className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight break-words"
                />
              ) : (
                <p className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight break-words">
                  {displayValue}
                </p>
              )}
            </div>

            {/* Trend indicator */}
            <div className="mt-3">
              <TrendIndicator 
                trend={trend} 
                direction={trendDirection}
                label={trendLabel}
              />
            </div>
          </div>

          {/* Icon with hover effect */}
          <div className="relative ml-4 flex-shrink-0">
            {/* Glow effect on hover */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${colors.accent} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`} 
              aria-hidden="true"
            />
            <div 
              className={`
                relative p-3.5 sm:p-4 rounded-2xl 
                ${colors.iconBg} ${colors.iconText}
                group-hover:scale-110 transition-transform duration-300
                shadow-sm
              `}
              aria-hidden="true"
            >
              {icon}
            </div>
          </div>
        </div>

        {/* Bottom accent line on hover */}
        <div 
          className={`absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r ${colors.accent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          aria-hidden="true"
        />
      </div>
    </CardWrapper>
  );
}
