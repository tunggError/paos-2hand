"use client";

import { motion } from 'framer-motion';
import Marquee from './Marquee';

export default function Hero() {
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, type: "spring", bounce: 0.4 }} 
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tighter leading-[0.9]"
          >
            Định Hình <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-olive-600 to-gray-900 drop-shadow-md">
              Phong Cách
            </span>
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
            <motion.a 
              href="#products" 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-olive-600 text-white font-black text-lg px-12 py-4 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] border-4 border-gray-900 hover:bg-olive-500 transition-all uppercase tracking-widest"
            >
              Shop Now
            </motion.a>
          </motion.div>
        </div>
      </section>
      <Marquee />
    </>
  );
}
