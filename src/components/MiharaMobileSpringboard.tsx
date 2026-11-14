"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/data";

interface MiharaMobileSpringboardProps {
  products?: Product[];
}

// 4 high-fashion wallpapers matching Mihara Yasuhiro's top_contents_1..4
const MOBILE_WALLPAPERS = [
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
];

export default function MiharaMobileSpringboard({ products = [] }: MiharaMobileSpringboardProps) {
  const { cart, setIsCartOpen } = useCart();
  const [wallpaperIndex, setWallpaperIndex] = useState(0);

  // Random wallpaper on mount (Mihara top_contents_wonum style)
  useEffect(() => {
    setWallpaperIndex(Math.floor(Math.random() * MOBILE_WALLPAPERS.length));
  }, []);

  const teesCount = products.filter((p) => p.category === "tee").length || 92;
  const outerwearsCount = products.filter((p) => p.category === "outerwear").length || 28;
  const shirtsCount = products.filter((p) => p.category === "shirt").length || 27;
  const bottomsCount = products.filter((p) => p.category === "bottom").length || 20;

  // 12 iOS Springboard App Icons (4 columns x 3 rows)
  const APPS = [
    // ROW 1: PRIMARY CATEGORIES
    {
      id: "app-tee",
      name: "Áo Phông",
      icon: "👕",
      badge: `${teesCount}`,
      href: "/products?category=tee",
      bgGradient: "from-blue-500 to-indigo-600",
      accent: "#3b82f6",
    },
    {
      id: "app-outerwear",
      name: "Áo Khoác",
      icon: "🧥",
      badge: `${outerwearsCount}`,
      href: "/products?category=outerwear",
      bgGradient: "from-amber-500 to-orange-600",
      accent: "#f59e0b",
    },
    {
      id: "app-shirt",
      name: "Áo Sơ Mi",
      icon: "👔",
      badge: `${shirtsCount}`,
      href: "/products?category=shirt",
      bgGradient: "from-emerald-500 to-teal-700",
      accent: "#10b981",
    },
    {
      id: "app-bottom",
      name: "Quần Jeans",
      icon: "👖",
      badge: `${bottomsCount}`,
      href: "/products?category=bottom",
      bgGradient: "from-sky-500 to-blue-700",
      accent: "#0284c7",
    },

    // ROW 2: ARCHIVE & HIGHLIGHTS
    {
      id: "app-archive",
      name: "Archive",
      icon: "🗂️",
      badge: `${products.length || 167}`,
      href: "/products",
      bgGradient: "from-neutral-800 to-black",
      accent: "#000000",
    },
    {
      id: "app-new",
      name: "New Drop",
      icon: "🔥",
      badge: "HOT",
      href: "/products?sort=newest",
      bgGradient: "from-rose-500 to-red-600",
      accent: "#ef4444",
    },
    {
      id: "app-sale",
      name: "Sale 2Hand",
      icon: "🏷️",
      badge: "BEST",
      href: "/products",
      bgGradient: "from-yellow-500 to-amber-600",
      accent: "#eab308",
    },
    {
      id: "app-instagram",
      name: "Instagram",
      icon: "📷",
      badge: "50K",
      href: "https://www.instagram.com/paos.2hand/",
      external: true,
      bgGradient: "from-purple-600 via-pink-500 to-amber-400",
      accent: "#ec4899",
    },

    // ROW 3: EDITORIAL & UTILITY
    {
      id: "app-accessory",
      name: "Phụ Kiện",
      icon: "🧢",
      badge: "CAPS",
      href: "/products?category=accessory",
      bgGradient: "from-stone-600 to-stone-800",
      accent: "#78716c",
    },
    {
      id: "app-lookbook",
      name: "Lookbook",
      icon: "📖",
      badge: "2026",
      href: "/products",
      bgGradient: "from-slate-700 to-neutral-900",
      accent: "#475569",
    },
    {
      id: "app-cod",
      name: "Ship COD",
      icon: "🛵",
      badge: "TOÀN QUỐC",
      href: "https://www.instagram.com/paos.2hand/",
      external: true,
      bgGradient: "from-teal-600 to-cyan-700",
      accent: "#0d9488",
    },
    {
      id: "app-feedback",
      name: "Feedback",
      icon: "⭐",
      badge: "5.0",
      href: "https://www.instagram.com/paos.2hand/",
      external: true,
      bgGradient: "from-amber-400 to-yellow-600",
      accent: "#d97706",
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-black text-white select-none overflow-hidden pb-32">
      {/* 1. DYNAMIC FULLSCREEN WALLPAPER (Mihara top_contents background) */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${MOBILE_WALLPAPERS[wallpaperIndex]})`,
            filter: "brightness(55%)",
          }}
        />
        {/* Subtle vignette and glass lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70" />
      </div>

      {/* 2. TOP STATUS / BRAND HEADER (iPhone Lock Screen / Home Header style) */}
      <div className="relative z-10 pt-6 px-4 flex flex-col items-center text-center">
        {/* Circular Avatar Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/80 shadow-[0_0_24px_rgba(255,255,255,0.3)] relative mb-2"
        >
          <Image src="/logo.jpg" alt="Paos 2hand Logo" fill className="object-cover" priority />
        </motion.div>

        {/* Brand Typography */}
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] font-mono"
        >
          PAOS<span className="text-yellow-400">.</span>2HAND
        </motion.h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-gray-300 font-medium drop-shadow-md">
          Maison Paos • Mobile Springboard
        </p>

        {/* Subtle Status Pill */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-mono text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>HÀ NỘI STORE • SẴN SHIP TOÀN QUỐC</span>
        </div>
      </div>

      {/* 3. 4-COLUMN iOS APP ICON GRID (#top_icon / .top_icon_list) */}
      <div className="relative z-10 mt-6 px-4">
        <div className="grid grid-cols-4 gap-y-5 gap-x-2.5">
          {APPS.map((app, index) => {
            const AppWrapper = app.external ? "a" : Link;
            const extraProps = app.external
              ? { href: app.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: app.href };

            return (
              <motion.div
                key={app.id}
                initial={{ scale: 0.5, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + index * 0.035,
                  type: "spring",
                  stiffness: 450,
                  damping: 18,
                }}
                className="flex flex-col items-center"
              >
                <AppWrapper
                  {...(extraProps as any)}
                  className="group flex flex-col items-center focus:outline-none"
                >
                  {/* SQUIRCLE APP ICON (iOS 22.5% corner radius) */}
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className={`relative w-[62px] h-[62px] sm:w-[68px] sm:h-[68px] rounded-[22%] bg-gradient-to-b ${app.bgGradient} shadow-[0_8px_20px_rgba(0,0,0,0.45)] border border-white/25 flex items-center justify-center cursor-pointer transition-transform duration-150`}
                  >
                    {/* Top glass reflection highlight */}
                    <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-[22%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

                    {/* App Emoji / Symbol Icon */}
                    <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                      {app.icon}
                    </span>

                    {/* App Badge Pill (Counter / Hot tag) */}
                    {app.badge && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black font-mono border border-white shadow-sm leading-tight">
                        {app.badge}
                      </span>
                    )}
                  </motion.div>

                  {/* App Name Label (iOS Typography underneath) */}
                  <span className="mt-1.5 text-[11px] font-medium tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-center truncate max-w-[72px] leading-tight font-sans">
                    {app.name}
                  </span>
                </AppWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. MID WIDGET ROW (#mid_icon - Flagship & Highlights Widget) */}
      <div className="relative z-10 mt-7 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)] text-white"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <h4 className="text-xs font-black tracking-wider uppercase font-mono">
                TOPICS // PAOS ARCHIVE
              </h4>
            </div>
            <Link
              href="/products"
              className="text-[10px] font-mono text-yellow-300 font-bold hover:underline"
            >
              XEM TẤT CẢ →
            </Link>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-200">
            <div className="p-2 rounded-lg bg-black/30 border border-white/10">
              <p className="font-bold text-white">🔥 DROP TUYỂN CHỌN</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Tee, Flannel & Jackets</p>
            </div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/10">
              <p className="font-bold text-white">📦 COD TOÀN QUỐC</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Kiểm hàng trước nhận</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. iOS FROSTED GLASS BOTTOM DOCK BAR (#bot_icon style) */}
      <div className="fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 25 }}
          className="h-20 rounded-[28px] bg-white/85 dark:bg-neutral-900/85 backdrop-blur-2xl border border-white/50 dark:border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)] px-4 flex items-center justify-around"
        >
          {/* Dock App 1: Store Locator */}
          <a
            href="https://www.instagram.com/paos.2hand/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group active:scale-90 transition-transform"
          >
            <div className="w-12 h-12 rounded-[22%] bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-xl shadow-md border border-white/30">
              📍
            </div>
            <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              Store
            </span>
          </a>

          {/* Dock App 2: Direct Instagram Chat */}
          <a
            href="https://www.instagram.com/paos.2hand/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group active:scale-90 transition-transform"
          >
            <div className="w-12 h-12 rounded-[22%] bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 text-white flex items-center justify-center text-xl shadow-md border border-white/30">
              💬
            </div>
            <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              Direct IG
            </span>
          </a>

          {/* Dock App 3: Cart with Real-time Count */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center group active:scale-90 transition-transform cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-[22%] bg-gradient-to-tr from-emerald-400 to-green-600 text-white flex items-center justify-center text-xl shadow-md border border-white/30 relative">
              🛒
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black font-mono border-2 border-white flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              Giỏ Hàng
            </span>
          </button>

          {/* Dock App 4: Search & Products */}
          <Link
            href="/products"
            className="flex flex-col items-center group active:scale-90 transition-transform"
          >
            <div className="w-12 h-12 rounded-[22%] bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-xl shadow-md border border-white/30">
              🔍
            </div>
            <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              Tìm Kiếm
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
