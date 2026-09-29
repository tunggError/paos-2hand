"use client";

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export default function MagneticButton({ children, className, href }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const prefersReducedMotion = useReducedMotion();

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    // Only apply on devices with an accurate pointing device (mouse)
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Scale movement to max 6-8px
    // Using a factor of 0.1 usually yields a subtle 5-10px move for typical button sizes
    x.set(middleX * 0.1); 
    y.set(middleY * 0.1);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <a
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block focus:outline-none focus-visible:ring-4 focus-visible:ring-olive-500 focus-visible:ring-offset-4 focus-visible:ring-offset-cream-200 ${className || ''}`}
      style={{ touchAction: 'manipulation' }}
    >
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : springX, y: prefersReducedMotion ? 0 : springY }}
        className="w-full h-full"
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.div>
    </a>
  );
}
