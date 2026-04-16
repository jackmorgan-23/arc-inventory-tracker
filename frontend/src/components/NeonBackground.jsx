import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function NeonBackground({
  glowIntensity = 15,
  strokeWidth = 30,
  speed = 1,
  colors = ['#00f0ff', '#00ff41', '#ffe600', '#ff003c'],
  children
}) {
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05030a] font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 z-0">
        {/* Restored optimized ambient glowing rings */}
        <motion.div
          className="absolute top-1/2 right-[-20%] md:right-[10%] -translate-y-1/2 w-[120vw] h-[120vw] md:w-[800px] md:h-[800px] rounded-full border border-indigo-500/20 bg-[radial-gradient(circle,_rgba(79,70,229,0.1)_0%,_transparent_70%)]"
          style={{ willChange: "transform" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute top-1/2 right-[-20%] md:right-[10%] -translate-y-1/2 w-[119vw] h-[119vw] md:w-[798px] md:h-[798px] rounded-full border border-indigo-400/10 shadow-[0_0_80px_rgba(79,70,229,0.1)]" />

        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              willChange: "opacity",
            }}
            animate={{ opacity: [star.opacity, star.opacity * 2.5, star.opacity] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Safari fix: Removed extremely taxing SVG fractal noise that breaks GPU layer composite */}
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMinYMid slice"
          className="w-full h-full"
        >
          {/* Safari fix: SVG feGaussianBlur removed to prevent rendering lag. Using CSS drop-shadow instead. */}

          <motion.g
            style={{ willChange: "transform" }}
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {colors.map((color, i) => {
              const offset = i * (strokeWidth - 1);
              // Flowing in from the top right, bulging to the right edge, and swooping back to the bottom.
              const path = `M ${1300 + offset} -200 C ${2200 + offset} 300, ${1000 + offset} 800, ${1600 + offset} 1300`;

              return (
                <React.Fragment key={color}>
                  {/* Thick optimized CSS blur glow layer */}
                  <motion.path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth * 1.5}
                    fill="none"
                    strokeLinecap="round"
                    style={{ 
                      willChange: "opacity, stroke-dashoffset, filter",
                      filter: `blur(${glowIntensity}px)`
                    }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{
                      duration: 2.5 / speed,
                      ease: "easeOut",
                      delay: i * 0.15
                    }}
                  />
                  {/* Crisp core stroke layer */}
                  <motion.path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    style={{ willChange: "opacity, stroke-dashoffset" }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 2.5 / speed,
                      ease: "easeOut",
                      delay: i * 0.15
                    }}
                  />
                </React.Fragment>
              );
            })}
          </motion.g>
        </svg>
      </div>

      <div className="relative z-10 w-full h-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
