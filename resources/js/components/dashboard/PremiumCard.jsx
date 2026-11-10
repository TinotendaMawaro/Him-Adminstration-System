import { useState, useEffect, useRef } from "react";

// ============================================================================
// TYPE ALIAS (for documentation; project uses JavaScript)
// type PremiumCardVariant = 'sky' | 'emerald' | 'amber' | 'violet';
// interface PremiumCardProps {
//   id: string;
//   title: string;
//   value: number | string;
//   trend?: number | null;
//   trendDirection?: 'up' | 'down' | 'neutral';
//   trendLabel?: string;
//   icon: React.ReactNode;
//   variant?: PremiumCardVariant;
//   onClick?: (id: string) => void;
//   animateValue?: boolean;
//   className?: string;
//   loading?: boolean;
//   'aria-label'?: string;
//   sparklineData?: number[];
// }
// ============================================================================

// ============================================================================
// ANIMATED COUNTER — optimized, respect reduced motion
// ============================================================================

function AnimatedCounter({
  value,
  className = "",
  duration = 800,
  prefix = "",
  suffix = "",
  delay = 0,
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

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

    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    if (prefersReducedMotion) {
      const numericValue =
        typeof value === "string"
          ? parseInt(value.replace(/[^0-9]/g, ""), 10)
          : Number(value) || 0;
      setCount(numericValue);
      return;
    }

    const startTime = performance.now();
    const numericValue =
      typeof value === "string"
        ? parseInt(value.replace(/[^0-9]/g, ""), 10)
        : Number(value) || 0;

    if (numericValue < 10) {
      setCount(numericValue);
      return;
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * numericValue);
      setCount(currentCount);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration, isVisible, prefersReducedMotion]);

  const formattedCount = count.toLocaleString();

  return (
    <span
      ref={counterRef}
      className={`tabular-nums tracking-tight ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}

// ============================================================================
// SPARKLINE — ultra-refined micro-chart
// ============================================================================

function Sparkline({ data = [], variant = "emerald", size = "md" }) {
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  if (!data || data.length === 0) return null;

  const width = size === "sm" ? 64 : size === "lg" ? 96 : 80;
  const height = size === "sm" ? 24 : size === "lg" ? 32 : 28;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => ({
    x: padding + (idx / (data.length - 1)) * (width - 2 * padding),
    y: height - padding - ((val - min) / range) * (height - 2 * padding),
  }));

  // Build SVG path
  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");

  // Area path (closed shape)
  const areaD = `${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

  const colorClass = {
    sky: "text-sky-500",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    violet: "text-violet-600",
  }[variant] || "text-emerald-600";

  const glowMap = {
    sky: "rgba(2, 132, 199, 0.15)",
    emerald: "rgba(5, 150, 105, 0.15)",
    amber: "rgba(217, 119, 6, 0.15)",
    violet: "rgba(124, 58, 237, 0.15)",
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find nearest point
    const nearestIdx = points.findIndex((p, i) => {
      const next = points[i + 1];
      if (!next) return true;
      return x >= p.x && x <= next.x;
    });

    const idx = nearestIdx === -1 ? points.length - 1 : nearestIdx;
    setHoverIndex(idx);

    setMousePos({
      x: points[idx].x,
      y: points[idx].y,
      value: data[idx],
      date: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx] || "",
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(-1);
  };

  return (
    <div className="relative inline-block" ref={svgRef}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`premium-sparkline ${colorClass}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Trend over last 7 days"
        role="img"
      >
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaD}
          fill={`url(#gradient-${variant})`}
          opacity="0.5"
        />

        {/* Main line */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="premium-sparkline__path"
        />

        {/* Data points (visible on hover) */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoverIndex === idx ? 3 : 0}
            fill="currentColor"
            className="transition-all duration-200"
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoverIndex !== -1 && (
        <div
          className="premium-sparkline__tooltip"
          style={{
            left: mousePos.x,
            bottom: height - mousePos.y + 8,
          }}
        >
          <div className="font-bold">{mousePos.value.toLocaleString()}</div>
          <div className="text-[10px] opacity-70">{mousePos.date}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TREND INDICATOR — minimal badge with direction
// ============================================================================

function TrendIndicator({ trend, direction = "up", label = "vs last month" }) {
  if (trend === undefined || trend === null) return null;

  const isPositive = direction === "up";
  const isNeutral = direction === "neutral";
  const variant = isNeutral ? "neutral" : isPositive ? "up" : "down";

  return (
    <div className={`premium-card__trend premium-card__trend--${variant}`}>
      <svg
        className={`w-3.5 h-3.5 ${isNeutral ? "" : isPositive ? "" : "-rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 10.5L12 3l7.5 7.5"
        />
      </svg>
      <span>
        {isNeutral ? "—" : isPositive ? "+" : ""}
        {Math.abs(trend)}% {label}
      </span>
    </div>
  );
}

// ============================================================================
// CARD SKELETON — shimmer placeholder
// ============================================================================

function CardSkeleton() {
  return (
    <div className="premium-card" aria-hidden="true">
      <div className="premium-card__skeleton" />
      <div className="relative z-10 p-6 space-y-4">
        <div className="premium-card__header">
          <div className="space-y-2 flex-1">
            <div className="premium-card__skeleton-title" />
            <div className="premium-card__skeleton-value" />
          </div>
          <div className="premium-card__skeleton-icon" />
        </div>
        <div className="premium-card__skeleton-trend" />
      </div>
    </div>
  );
}

// ============================================================================
// PREMIUM CARD — executive-grade stat display
// ============================================================================

export default function PremiumCard({
  id,
  title,
  value,
  trend,
  trendDirection = "up",
  trendLabel = "vs last month",
  icon,
  variant = "emerald",
  onClick,
  animateValue = true,
  className = "",
  loading = false,
  "aria-label": ariaLabel,
  sparklineData = [],
}) {
  const [isHover, setIsHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Variant check
  const validVariants = ["sky", "emerald", "amber", "violet"];
  const safeVariant = validVariants.includes(variant) ? variant : "emerald";

  // Card wrapper with elevated hover
   const CardWrapper = ({ children, showWrapper = true }) => {
     const baseClasses = "premium-card group relative h-full w-full";
     const interactive = !!onClick;
     const variantClass = `premium-card--${safeVariant}`;
     const stateClasses = interactive
       ? "data-[interactive='true'] hover:[--shadow-4:0_12px_40px_rgba(0,0,0,0.12)]"
       : "";

     const cardClasses = `${baseClasses} ${variantClass} ${stateClasses} ${className}`;

    if (showWrapper && interactive) {
      return (
        <div
          className={cardClasses}
          data-interactive="true"
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick && onClick();
            }
          }}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => {
            setIsHover(false);
            setMousePos({ x: 50, y: 50 });
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePos({ x, y });
          }}
          aria-label={
            ariaLabel ||
            `${title}: ${typeof value === "number" ? value.toLocaleString() : value}`
          }
          style={{
            "--mouse-x": `${mousePos.x}%`,
            "--mouse-y": `${mousePos.y}%`,
          }}
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

  // Loading state
  if (loading) {
    return (
      <CardWrapper showWrapper={false}>
        <CardSkeleton />
      </CardWrapper>
    );
  }

  // Format value
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <CardWrapper>
      <div className="relative z-10" style={{ padding: "var(--card-padding)" }}>
        {/* Header */}
        <header className="premium-card__header">
          <div className="flex-1 min-w-0">
            <h3 className="premium-card__title">{title}</h3>

            <div className="premium-card__value-container">
              {animateValue && typeof value === "number" ? (
                <AnimatedCounter
                  value={value}
                  duration={800}
                  className="premium-card__value"
                />
              ) : (
                <div className="premium-card__value">{displayValue}</div>
              )}
            </div>

            {trend !== undefined && trend !== null && (
              <div className="mt-3">
                <TrendIndicator
                  trend={trend}
                  direction={trendDirection}
                  label={trendLabel}
                />
              </div>
            )}
          </div>

          {/* Icon badge with glow */}
          <div className="premium-card__icon-container">
            <div
              className="premium-card__icon-badge"
              aria-hidden="true"
            >
              {icon}
            </div>
          </div>
        </header>
      </div>

      {/* Footer with sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <footer className="premium-card__footer hidden sm:block">
          <div className="flex flex-col items-start gap-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-w-0 [&_svg]:max-w-full">
            <Sparkline data={sparklineData} variant={safeVariant} size="md" />
            <span className="text-[11px] text-[var(--color-text-tertiary)] tracking-normal">
              last 7 days
            </span>
          </div>
        </footer>
      )}

      {/* Subtle ambient glow on hover */}
      {onClick && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%), var(--glow-color) 0%, transparent 50%)`,
          }}
          aria-hidden="true"
        />
      )}
    </CardWrapper>
  );
}

// Export types for TypeScript usage (if TS enabled)
// export type PremiumCardVariant = 'sky' | 'emerald' | 'amber' | 'violet';
// export interface PremiumCardProps {
//   id: string;
//   title: string;
//   value: number | string;
//   trend?: number | null;
//   trendDirection?: 'up' | 'down' | 'neutral';
//   trendLabel?: string;
//   icon: React.ReactNode;
//   variant?: PremiumCardVariant;
//   onClick?: (id: string) => void;
//   animateValue?: boolean;
//   className?: string;
//   loading?: boolean;
//   'aria-label'?: string;
//   sparklineData?: number[];
// }
