import { useState, useEffect, useRef } from "react";

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * numericValue);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, isVisible]);

  // Format the number with commas
  const formattedCount = count.toLocaleString();

  return (
    <span ref={counterRef} className="tabular-nums">
      {prefix}{formattedCount}{suffix}
    </span>
  );
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  onClick, 
  color = "sky",
  premium = false,
  animateValue = true,
  className = "" 
}) {
  // Color mapping for premium cards
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
      gradient: "from-gold-400/20 via-gold-100/10 to-transparent",
      iconBg: "bg-gold-100/80",
      iconText: "text-gold-600",
      accent: "from-gold-400 to-gold-500",
      glow: "shadow-gold-500/10",
    },
  };

  const colors = colorMap[color] || colorMap.sky;

  if (premium) {
    // Apple iCloud-inspired premium card
    return (
      <div 
        className={`group relative ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {/* Subtle glow on hover */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10`}></div>
        
        {/* Main card */}
        <div className="relative glass-card-premium rounded-3xl overflow-hidden hover-elevation transition-smooth">
          {/* Top gradient accent */}
          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          
          <div className="p-6">
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-4xl font-bold text-gray-900 mt-3 tracking-tight">
                  {animateValue ? (
                    <AnimatedCounter value={value} duration={2000} />
                  ) : (
                    value
                  )}
                </p>
                
                {/* Trend indicator */}
                {trend !== undefined && (
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    trend > 0 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-red-50 text-red-600"
                  }`}>
                    <svg className={`w-3.5 h-3.5 ${trend > 0 ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {trend > 0 ? "+" : ""}{trend}%
                  </div>
                )}
              </div>

              {/* Icon with animated glow on hover */}
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className={`relative p-3.5 rounded-2xl ${colors.iconBg} ${colors.iconText} group-hover:scale-110 transition-transform duration-300`}>
                  {icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original premium card style (for backward compatibility)
  return (
    <div className={`group relative h-full ${className}`}>
      {/* Glow border effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400 via-sky-400 to-gold-400 rounded-3xl opacity-0 group-hover:opacity-60 blur-md transition-all duration-500 -z-10 group-hover:blur-xl"></div>
      
      {/* Frosted glass card */}
      <div 
        className={`relative h-full glass-card rounded-3xl p-8 hover-elevation transition-smooth border border-white/40 hover:border-sky-200/60 overflow-hidden transform group-hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-100 to-sky-100 rounded-full opacity-0 group-hover:opacity-40 -mr-16 -mt-16 transition-opacity duration-300"></div>
        
        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 font-bold tracking-wide uppercase text-sm">Members</p>
              <div className="mt-3">
                <p className="text-4xl font-black bg-gradient-to-r from-gray-900 to-sky-900 bg-clip-text text-transparent">{value}</p>
              </div>
              
              {/* Trend indicator */}
              {trend && (
                <div className={`text-sm font-bold mt-3 flex items-center gap-2 ${
                  trend > 0 
                    ? "text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit" 
                    : "text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit"
                }`}>
                  <svg className={`w-4 h-4 ${trend > 0 ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" />
                  </svg>
                  {trend > 0 ? "+" : ""}{trend}% from last week
                </div>
              )}
            </div>

            {/* Icon Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-sky-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200 shadow-glow-sky-sm">
                {icon}
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-gold-400 to-sky-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
}
