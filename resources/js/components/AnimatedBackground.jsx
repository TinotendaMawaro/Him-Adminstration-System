import { useEffect, useRef, useState, useMemo } from "react";

export default function AnimatedBackground() {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Mouse Parallax Effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 50;
      const y = (e.clientY - innerHeight / 2) / 50;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Generate particles with warm, spiritual aesthetic
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: 3 + Math.random() * 6,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 18 + Math.random() * 25,
      delay: Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.4,
      // Warm gold and soft blue particles
      colorType: Math.random() > 0.6 ? 'gold' : 'sky',
    }));
  }, []);

  const keyframesStyle = `
    @keyframes floatParticle {
      0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: var(--particle-opacity);
      }
      90% {
        opacity: var(--particle-opacity);
      }
      100% {
        transform: translateY(-100px) translateX(20px);
        opacity: 0;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: var(--particle-opacity);
      }
      50% {
        transform: scale(1.5);
        opacity: calc(var(--particle-opacity) * 0.5);
      }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 40%, #fffbeb 70%, #fef3c7 100%)",
        }}
      >
        {/* Subtle warm overlay for gold tint */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(255,251,240,0.3) 0%, rgba(254,243,199,0.1) 50%, rgba(240,249,255,0.2) 100%)",
          }}
        />
        {/* Floating particles with glow - warm gold and soft blue */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              backgroundColor: particle.colorType === 'gold' 
                ? `rgba(212, 175, 55, ${particle.opacity})` 
                : `rgba(14, 165, 233, ${particle.opacity})`,
              boxShadow: particle.colorType === 'gold'
                ? `0 0 ${particle.size * 2}px rgba(212, 175, 55, ${particle.opacity * 0.6})`
                : `0 0 ${particle.size * 2}px rgba(14, 165, 233, ${particle.opacity * 0.6})`,
              animation: `floatParticle ${particle.duration}s ease-in-out infinite, pulse ${particle.duration * 0.5}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s, ${particle.delay}s`,
              '--particle-opacity': particle.opacity,
            }}
          />
        ))}
        
        {/* Larger glowing orbs */}
        <div
          className="absolute rounded-full"
          style={{
            width: "300px",
            height: "300px",
            left: "10%",
            top: "20%",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "400px",
            height: "400px",
            right: "10%",
            bottom: "20%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "pulse 12s ease-in-out infinite reverse",
          }}
        />
      </div>
    </>
  );
}
