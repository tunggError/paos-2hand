"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show splash for 1.2s then start the exit animation (split doors)
    const timer = setTimeout(() => {
      setShow(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
          {/* Top Door */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="absolute top-0 left-0 right-0 h-[50.5%] bg-cream-100 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
          />
          
          {/* Bottom Door */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="absolute bottom-0 left-0 right-0 h-[50.5%] bg-cream-100 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]"
          />

          {/* Logo and Name Container */}
          <motion.div
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[6px] border-olive-600 shadow-2xl relative"
            >
              <Image 
                src="/logo.jpg" 
                alt="Pao's 2hand Logo" 
                fill 
                className="object-cover" 
                priority 
              />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 uppercase drop-shadow-md"
            >
              Paos<span className="text-olive-600">.2hand</span>
            </motion.h1>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
