"use client";

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import Marquee from './Marquee';
import MagneticButton from './MagneticButton';

export default function Hero() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const reverseX = useTransform(springX, (v) => -v);
  const reverseY = useTransform(springY, (v) => -v);

  const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (prefersReducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!h1Ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = h1Ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    mouseX.set(middleX * 0.1);
    mouseY.set(middleY * 0.1);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <>
      <section className="bg-cream-200 text-gray-900 pt-16 pb-12 px-4 relative overflow-hidden border-b-4 border-gray-900">
        {/* Antigravity floating elements in background */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-24 h-24 bg-olive-500 rounded-full opacity-20 blur-xl"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-20 w-40 h-40 bg-gray-900 rounded-full opacity-10 blur-2xl"
        />

        <div className="container mx-auto text-center max-w-4xl relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.3, type: "spring" }}
            className="mb-4 inline-block bg-gray-900 text-cream-100 font-black px-6 py-2 uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(101,114,64,1)] border-2 border-gray-900"
          >
            Est. 2026
          </motion.div>

          <motion.h1 
            ref={h1Ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, type: "spring", bounce: 0.4 }} 
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tighter leading-[0.9] cursor-default"
          >
            <motion.div style={{ x: prefersReducedMotion ? 0 : springX, y: prefersReducedMotion ? 0 : springY }} className="inline-block">
              Định Hình
            </motion.div> 
            <br/> 
            <motion.div style={{ x: prefersReducedMotion ? 0 : reverseX, y: prefersReducedMotion ? 0 : reverseY }} className="inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-olive-600 to-gray-900 drop-shadow-md">
                Phong Cách
              </span>
            </motion.div>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="text-lg md:text-xl text-gray-700 font-bold mb-10 max-w-2xl mx-auto uppercase tracking-wide border-y-2 border-gray-900 py-3"
          >
            Second-hand chất lượng cao. Cập nhật liên tục từ @paos.2hand.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.1, type: "spring", bounce: 0.5 }}
          >
            <MagneticButton href="#products" className="group">
              <div className="inline-block bg-olive-600 text-white font-black text-lg px-12 py-4 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] border-4 border-gray-900 hover:bg-olive-500 transition-all uppercase tracking-widest group-hover:scale-105 group-hover:-translate-y-1">
                Shop Now
              </div>
            </MagneticButton>
          </motion.div>
        </div>
      </section>
      <Marquee />
    </>
  );
}
