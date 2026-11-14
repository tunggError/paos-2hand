"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import MiharaPopups from "./MiharaPopups";
import MiharaMobileSpringboard from "./MiharaMobileSpringboard";
import { Product } from "@/lib/data";

interface MiharaHeroProps {
  products?: Product[];
  announcements?: Product[];
}

// High fashion streetwear editorial backdrops
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85",
    caption: "PAOS VINTAGE ARCHIVE 2026",
  },
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85",
    caption: "TOKYO STREETWEAR INSPIRATION",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85",
    caption: "CURATED SECOND-HAND SELECTION",
  },
];

export default function MiharaHero({ products = [], announcements = [] }: MiharaHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto transition background slides every 8 seconds (matching Mihara)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* 1. MOBILE EXPERIENCE: AUTHENTIC MIHARA YASUHIRO iOS SPRINGBOARD APP GRID */}
      <div className="block md:hidden">
        <MiharaMobileSpringboard products={products} />
      </div>

      {/* 2. DESKTOP EXPERIENCE: AUTHENTIC MIHARA RETRO DESKTOP OS WITH 9 POPUPS */}
      <div className="hidden md:block">
        <section className="relative w-full h-[calc(100vh-4rem)] min-h-[640px] max-h-[1080px] overflow-hidden bg-black text-white flex flex-col justify-between select-none border-b-4 border-gray-900">
          {/* 1. BACKGROUND FULLSCREEN SLIDER */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="sync">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${HERO_SLIDES[currentSlide].image})`,
                }}
              />
            </AnimatePresence>

            {/* High-fashion moody overlays */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
          </div>

          {/* 2. TOP ANNOUNCEMENT BAR & SUBTLE BRANDING */}
          <div className="relative z-10 w-full px-6 pt-5 flex justify-between items-center text-xs uppercase tracking-widest font-mono text-gray-300">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white tracking-wider">HANOI // TOKYO ARCHIVE</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[11px] text-gray-400">
              <span>DROP MỚI MỖI TUẦN</span>
              <span>•</span>
              <span>CHẤT LƯỢNG TUYỂN CHỌN 9-10/10</span>
              <span>•</span>
              <span>AUTHENTIC GUARANTEED</span>
            </div>
            <a
              href="https://www.instagram.com/paos.2hand/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors font-bold underline underline-offset-4"
            >
              @PAOS.2HAND ↗
            </a>
          </div>

          {/* 3. CENTER BRAND LOGO & HERO TYPOGRAPHY (Mihara top_content_renew style) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 my-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              {/* Circular Emblem / Logo with brutalist frame */}
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.25)] relative mb-5">
                <Image
                  src="/logo.jpg"
                  alt="Paos 2hand Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Main Brand Title - Avant-Garde High-Fashion Typography */}
              <h1
                className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-[-0.05em] uppercase leading-[0.9] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: "Anton, 'Noto Sans JP', Montserrat, sans-serif" }}
              >
                PAOS<span className="text-yellow-400">.</span>2HAND
              </h1>

              <p className="mt-4 md:mt-5 text-xs sm:text-sm md:text-base tracking-[0.35em] md:tracking-[0.5em] font-medium text-gray-200 uppercase max-w-2xl px-4 drop-shadow-md">
                Maison Paos • Curated Streetwear & Vintage Archive
              </p>

              <div className="mt-3.5 flex items-center gap-3 text-[11px] font-mono tracking-widest text-gray-400 uppercase">
                <span>Est. 2026</span>
                <span>/</span>
                <span>Handpicked Pieces</span>
                <span>/</span>
                <span>Worldwide Vibe</span>
              </div>
            </motion.div>
          </div>

          {/* 4. BOTTOM CATEGORY NAVIGATION (Mihara top_pc_nav style with crisp borders) */}
          <div className="relative z-10 w-full pb-8 px-4 flex flex-col items-center">
            {/* Navigation Blocks with bold borders & shadows */}
            <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
              {[
                { label: "ÁO PHÔNG / TEES", href: "/products?category=tee" },
                { label: "ÁO SƠ MI / SHIRTS", href: "/products?category=shirt" },
                { label: "ÁO KHOÁC / JACKETS", href: "/products?category=outerwear" },
                { label: "QUẦN / BOTTOMS", href: "/products?category=bottom" },
                { label: "PHỤ KIỆN / ACC", href: "/products?category=accessory" },
                { label: "TẤT CẢ / ALL ITEMS", href: "/products" },
              ].map((btn, index) => (
                <motion.div
                  key={btn.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.08 }}
                >
                  <Link
                    href={btn.href}
                    className="group relative flex items-center justify-center h-12 md:h-14 bg-white hover:bg-yellow-400 text-black font-black text-[11px] md:text-xs tracking-wider uppercase transition-all duration-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="truncate px-2 text-center">{btn.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. PINNED RETRO POP-UPS - Desktop Only */}
        <MiharaPopups products={products} announcements={announcements} />
      </div>
    </>
  );
}
