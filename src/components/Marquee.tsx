"use client";

import { motion } from 'framer-motion';

export default function Marquee() {
  const text = "🚨 PAO'S 2HAND ORIGINAL STREETWEAR 🚨 NEW DROP EVERY WEEK 🚨 100% AUTHENTIC 🚨 ";
  
  return (
    <div className="bg-gray-900 text-cream-100 py-3 overflow-hidden whitespace-nowrap border-y-4 border-black relative flex items-center">
      <motion.div
        className="font-black uppercase text-xl md:text-2xl tracking-widest inline-block"
        animate={{ x: [0, -1035] }}
        transition={{ ease: "linear", duration: 10, repeat: Infinity }}
      >
        {/* Repeat the text multiple times to ensure seamless looping */}
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </motion.div>
    </div>
  );
}
