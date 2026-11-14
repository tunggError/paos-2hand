"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Product } from "@/lib/data";

interface PopupItem {
  id: string;
  type: "tee" | "outerwear" | "shirt" | "bottom" | "archive_grid" | "store_info" | "topics" | "lookbook" | "instagram";
  title: string;
  image?: string;
  images?: string[];
  link: string;
  tag?: string;
  caption?: string;
  rotation: number;
  desktop: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    width: number;
    height?: number;
  };
  mobile: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    width: number;
  };
  delay: number;
}

// 9 Mihara Yasuhiro-style popup window positions with diverse sizes (big & small)
const POPUP_LAYOUTS = [
  // 0: TOPICS (Small Square / Portrait - Far Left)
  {
    key: "topics",
    desktop: { top: "145px", left: "20px", width: 170 },
    mobile: { top: "135px", left: "10px", width: 155 },
    delay: 0.4,
    rotation: -1.2,
  },
  // 1: BAG & TEE COLLECTION (Wide Landscape - Top Left)
  {
    key: "tee",
    desktop: { top: "78px", left: "95px", width: 360 },
    mobile: { top: "75px", left: "14px", width: 235 },
    delay: 0.55,
    rotation: 0.6,
  },
  // 2: SHOES & OUTERWEAR COLLECTION (Wide Landscape - Center Top)
  {
    key: "outerwear",
    desktop: { top: "82px", left: "calc(50% - 145px)", width: 355 },
    mobile: { top: "80px", right: "14px", width: 235 },
    delay: 0.7,
    rotation: -0.8,
  },
  // 3: ARCHIVE SELECTION (Large Square 3x3 Grid - Top Right)
  {
    key: "archive_grid",
    desktop: { top: "78px", right: "35px", width: 370 },
    mobile: { top: "160px", right: "15px", width: 245 },
    delay: 0.85,
    rotation: -0.5,
  },
  // 4: STORE LOCATOR (Medium Landscape - Center Left)
  {
    key: "store_info",
    desktop: { top: "270px", left: "245px", width: 335 },
    mobile: { top: "270px", left: "20px", width: 235 },
    delay: 1.0,
    rotation: 0.6,
  },
  // 5: SHIRTS COLLECTION (Medium Square - Bottom Left)
  {
    key: "shirt",
    desktop: { bottom: "95px", left: "75px", width: 300 },
    mobile: { bottom: "115px", left: "15px", width: 215 },
    delay: 1.14,
    rotation: 1.0,
  },
  // 6: BOTTOMS & DENIM (Portrait / Tall - Center Right)
  {
    key: "bottom",
    desktop: { top: "275px", right: "260px", width: 210 },
    mobile: { top: "350px", left: "20px", width: 175 },
    delay: 1.28,
    rotation: 1.2,
  },
  // 7: WOMENS / LOOKBOOK (Wide Landscape - Bottom Right Mid)
  {
    key: "lookbook",
    desktop: { bottom: "75px", right: "195px", width: 335 },
    mobile: { bottom: "85px", right: "20px", width: 220 },
    delay: 1.42,
    rotation: 1.0,
  },
  // 8: INSTAGRAM @PAOS.2HAND (Medium Profile Card - Bottom Right Corner)
  {
    key: "instagram",
    desktop: { bottom: "40px", right: "25px", width: 315 },
    mobile: { bottom: "35px", right: "15px", width: 245 },
    delay: 1.56,
    rotation: -0.8,
  },
];

// Helper to build the 9 authentic Mihara windows from store data
function buildMiharaPopups(products: Product[]): PopupItem[] {
  const tees = products.filter((p) => p.category === "tee");
  const outerwears = products.filter((p) => p.category === "outerwear");
  const shirts = products.filter((p) => p.category === "shirt");
  const bottoms = products.filter((p) => p.category === "bottom");
  const gridItems = products.slice(0, 9);

  const list: PopupItem[] = [];

  // 0. TOPICS (Small Square)
  const l0 = POPUP_LAYOUTS[0];
  list.push({
    id: "popup-topics",
    type: "topics",
    title: "TOPICS",
    link: "/products",
    rotation: l0.rotation,
    desktop: l0.desktop,
    mobile: l0.mobile,
    delay: l0.delay,
  });

  // 1. TEE COLLECTION (Wide Landscape)
  const l1 = POPUP_LAYOUTS[1];
  list.push({
    id: "popup-tee",
    type: "tee",
    title: "TEE COLLECTION",
    image: tees[0]?.image || "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    link: "/products?category=tee",
    tag: `${tees.length || 92} SẢN PHẨM`,
    caption: "VINTAGE GRAPHIC TEES // POLO & TOPS",
    rotation: l1.rotation,
    desktop: l1.desktop,
    mobile: l1.mobile,
    delay: l1.delay,
  });

  // 2. SHOES & OUTERWEAR (Wide Landscape)
  const l2 = POPUP_LAYOUTS[2];
  list.push({
    id: "popup-outerwear",
    type: "outerwear",
    title: "OUTERWEAR COLLECTION",
    image: outerwears[0]?.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
    images: outerwears.slice(0, 2).map((p) => p.image),
    link: "/products?category=outerwear",
    tag: `${outerwears.length || 28} SẢN PHẨM`,
    caption: "BOMBERS, HOODIES & WINTER JACKETS",
    rotation: l2.rotation,
    desktop: l2.desktop,
    mobile: l2.mobile,
    delay: l2.delay,
  });

  // 3. ARCHIVE SELECTION 3x3 GRID (Large Square - Mihara Signature!)
  const l3 = POPUP_LAYOUTS[3];
  list.push({
    id: "popup-archive-grid",
    type: "archive_grid",
    title: "ARCHIVE SELECTION",
    images: gridItems.map((p) => p.image).filter(Boolean),
    link: "/products",
    tag: "167 SẢN PHẨM",
    caption: "AUTUMN/WINTER 2026 // PAOS ARCHIVE COLLECTION",
    rotation: l3.rotation,
    desktop: l3.desktop,
    mobile: l3.mobile,
    delay: l3.delay,
  });

  // 4. STORE LOCATOR
  const l4 = POPUP_LAYOUTS[4];
  list.push({
    id: "popup-store-locator",
    type: "store_info",
    title: "STORE LOCATOR",
    link: "https://www.instagram.com/paos.2hand/",
    rotation: l4.rotation,
    desktop: l4.desktop,
    mobile: l4.mobile,
    delay: l4.delay,
  });

  // 5. SHIRTS COLLECTION (Medium Landscape)
  const l5 = POPUP_LAYOUTS[5];
  list.push({
    id: "popup-shirt",
    type: "shirt",
    title: "SHIRTS COLLECTION",
    image: shirts[0]?.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
    link: "/products?category=shirt",
    tag: `${shirts.length || 27} SẢN PHẨM`,
    caption: "FLANNEL, OXFORD & VINTAGE SHIRTS",
    rotation: l5.rotation,
    desktop: l5.desktop,
    mobile: l5.mobile,
    delay: l5.delay,
  });

  // 6. BOTTOMS & DENIM (Tall Portrait)
  const l6 = POPUP_LAYOUTS[6];
  list.push({
    id: "popup-bottom",
    type: "bottom",
    title: "BOTTOMS & DENIM",
    image: bottoms[0]?.image || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
    link: "/products?category=bottom",
    tag: `${bottoms.length || 20} SẢN PHẨM`,
    caption: "JEANS, KAKI & CARGO",
    rotation: l6.rotation,
    desktop: l6.desktop,
    mobile: l6.mobile,
    delay: l6.delay,
  });

  // 7. WOMENS / LOOKBOOK (Wide Landscape)
  const l7 = POPUP_LAYOUTS[7];
  list.push({
    id: "popup-lookbook",
    type: "lookbook",
    title: "LOOKBOOK 2026",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    link: "/products",
    caption: "STREETWEAR ARCHIVE // TOKYO INSPIRATION",
    rotation: l7.rotation,
    desktop: l7.desktop,
    mobile: l7.mobile,
    delay: l7.delay,
  });

  // 8. INSTAGRAM OFFICIAL
  const l8 = POPUP_LAYOUTS[8];
  list.push({
    id: "popup-instagram-official",
    type: "instagram",
    title: "instagram",
    image: "/logo.jpg",
    link: "https://www.instagram.com/paos.2hand/",
    rotation: l8.rotation,
    desktop: l8.desktop,
    mobile: l8.mobile,
    delay: l8.delay,
  });

  return list;
}

// Retro sound effect synthesis
function playRetroTone(type: "pop" | "close" | "chime") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "pop") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === "close") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === "chime") {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.22);
      });
    }
  } catch {
    // AudioContext blocked before first user gesture
  }
}

interface MiharaPopupsProps {
  products?: Product[];
  announcements?: Product[];
}

export default function MiharaPopups({ products = [] }: MiharaPopupsProps) {
  const popups = useMemo(() => buildMiharaPopups(products), [products]);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  
  // Directly initialize z-indexes on initial render to prevent layout jump and re-renders
  const [activeZIndex, setActiveZIndex] = useState<Record<string, number>>(() => {
    const initialZ: Record<string, number> = {};
    popups.forEach((item, i) => {
      initialZ[item.id] = 20 + i;
    });
    return initialZ;
  });
  const [highestZ, setHighestZ] = useState<number>(() => 20 + popups.length + 1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const bringToFront = (id: string) => {
    const nextZ = Math.min(45, highestZ + 1);
    setHighestZ(nextZ);
    setActiveZIndex((prev) => ({
      ...prev,
      [id]: nextZ,
    }));
  };

  const closePopup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) playRetroTone("close");
    setClosedIds((prev) => new Set([...prev, id]));
  };

  const closeAll = () => {
    if (soundEnabled) playRetroTone("close");
    const allIds = new Set(popups.map((p) => p.id));
    setClosedIds(allIds);
  };

  const reopenAll = () => {
    if (soundEnabled) playRetroTone("chime");
    setClosedIds(new Set());
  };

  // On mobile (< 768px): The homepage uses the authentic Mihara iOS Springboard Grid instead of desktop popups
  if (isMobile) return null;

  const visiblePopups = popups;
  const activeCount = visiblePopups.filter((p) => !closedIds.has(p.id)).length;

  return (
    <>
      {/* POPUPS CONTAINER - Fixed to viewport so windows remain pinned when scrolling down to footer */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-30">
        <AnimatePresence>
          {visiblePopups.map((item) => {
            if (closedIds.has(item.id)) return null;

            const pos = isMobile ? item.mobile : item.desktop;
            const currentZ = activeZIndex[item.id] || 20;

            return (
              <motion.div
                key={item.id}
                id={item.id}
                drag
                dragMomentum={false}
                dragElastic={0.05}
                onMouseDown={() => bringToFront(item.id)}
                onTouchStart={() => bringToFront(item.id)}
                initial={{
                  scale: 0.05,
                  opacity: 0,
                  rotate: item.rotation - 1.5,
                }}
                animate={{
                  scale: [0.05, 1.36, 0.78, 1.14, 0.92, 1.04, 0.98, 1],
                  opacity: [0, 1, 1, 1, 1, 1, 1, 1],
                  rotate: [
                    item.rotation - 1.5,
                    item.rotation + 2,
                    item.rotation - 1.2,
                    item.rotation + 0.6,
                    item.rotation - 0.3,
                    item.rotation,
                    item.rotation,
                    item.rotation,
                  ],
                }}
                exit={{
                  scale: 0.05,
                  opacity: 0,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
                transition={{
                  delay: item.delay,
                  duration: 0.44,
                  times: [0, 0.30, 0.50, 0.68, 0.82, 0.92, 0.97, 1],
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  top: pos.top,
                  bottom: pos.bottom,
                  left: pos.left,
                  right: pos.right,
                  width: pos.width,
                  zIndex: currentZ,
                  transformOrigin: "center center",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="pointer-events-auto select-none cursor-move group touch-none transform-gpu will-change-transform"
              >
                {/* EXACT MIHARA YASUHIRO WINDOW SHELL: 2px Blue Border, Pure White Content, Red [X] */}
                <div className="bg-white border-2 border-[#0048d0] shadow-[0_10px_30px_rgba(0,0,0,0.32)] overflow-hidden transition-shadow duration-150 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.48)]">
                  {/* ROYAL BLUE TITLE BAR */}
                  <div className="bg-[#0048d0] text-white flex items-center justify-between px-2 py-1 select-none cursor-grab active:cursor-grabbing">
                    <span
                      className="text-[11px] font-bold tracking-wider uppercase font-mono truncate text-white"
                      style={{ letterSpacing: "0.08em" }}
                    >
                      {item.title}
                    </span>

                    {/* RED SQUARE RETRO CLOSE BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => closePopup(item.id, e)}
                      className="w-4 h-4 bg-[#e02e24] hover:bg-[#b71c1c] text-white flex items-center justify-center text-[10px] font-black border border-white/40 leading-none cursor-pointer shrink-0 ml-2 transition-colors shadow-sm"
                      title="Đóng cửa sổ"
                    >
                      ✕
                    </button>
                  </div>

                  {/* WINDOW BODY CONTENT (Varying by window type) */}
                  <div className="bg-white text-black relative overflow-hidden">
                    {/* CASE 1: 3x3 ARCHIVE SELECTION (Mihara's Small Leather Goods layout) */}
                    {item.type === "archive_grid" && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (soundEnabled) playRetroTone("pop");
                        }}
                        className="block p-2 group/link relative"
                      >
                        <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1.5 border border-gray-200">
                          {(item.images || []).slice(0, 9).map((imgSrc, i) => (
                            <div key={i} className="aspect-square bg-white border border-gray-200 overflow-hidden relative">
                              <img
                                src={imgSrc}
                                alt={`Archive ${i + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-[9px] font-mono tracking-widest text-gray-600 uppercase font-bold">
                            {item.caption}
                          </p>
                        </div>
                        {/* EXACT MIHARA BLUE HOVER OVERLAY (No text buttons) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0573d9]/65 to-[#05139f]/75 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      </Link>
                    )}

                    {/* CASE 2: TOPICS (Small Square with stamped logo) */}
                    {item.type === "topics" && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (soundEnabled) playRetroTone("pop");
                        }}
                        className="block p-3 text-center group/link relative overflow-hidden"
                      >
                        <div className="h-28 flex flex-col items-center justify-center border border-dashed border-gray-300 bg-neutral-50 relative overflow-hidden">
                          {/* Stamped Red TOPICS Box */}
                          <div className="border-2 border-red-600 px-2 py-0.5 text-red-600 font-black text-sm tracking-wider uppercase transform -rotate-1 mb-2">
                            TOPICS
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                            NEW DROP 2026
                          </span>
                          <span className="text-[9px] text-gray-400 mt-1 font-mono">
                            PAOS.2HAND
                          </span>
                        </div>
                        {/* EXACT MIHARA BLUE HOVER OVERLAY (No text buttons) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0573d9]/65 to-[#05139f]/75 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      </Link>
                    )}

                    {/* CASE 3: STORE LOCATOR (Mihara's Store Locator layout) */}
                    {item.type === "store_info" && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (soundEnabled) playRetroTone("pop");
                        }}
                        className="block p-3 text-[11px] group/link relative overflow-hidden"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2.5 pb-2 border-b border-gray-200">
                            <div className="w-12 h-12 bg-neutral-100 border border-gray-300 overflow-hidden shrink-0">
                              <img src="/logo.jpg" alt="Store" decoding="async" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-tight">HÀ NỘI FLAGSHIP</h5>
                              <p className="text-gray-500 text-[10px] leading-tight mt-0.5">Streetwear & Đồ si tuyển chọn Nhật/Mỹ</p>
                              <span className="inline-block mt-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 border border-emerald-200">
                                COD TOÀN QUỐC
                              </span>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-600 space-y-1 font-mono">
                            <p>• Hỗ trợ tư vấn số đo & hình ảnh chi tiết</p>
                            <p>• Nhận đơn qua Direct Instagram @paos.2hand</p>
                          </div>
                        </div>
                        {/* EXACT MIHARA BLUE HOVER OVERLAY (No text buttons) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0573d9]/65 to-[#05139f]/75 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      </a>
                    )}

                    {/* CASE 4: SHOES / OUTERWEAR (Two items side by side or featured showcase) */}
                    {item.type === "outerwear" && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (soundEnabled) playRetroTone("pop");
                        }}
                        className="block p-2 group/link relative overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 h-36 bg-gray-50 p-1 border border-gray-200 overflow-hidden">
                          {((item.images && item.images.length > 1) ? item.images : [item.image, item.image]).slice(0, 2).map((img, idx) => (
                            <div key={idx} className="relative h-full bg-white border border-gray-200 overflow-hidden">
                              <img
                                src={img || item.image}
                                alt="Outerwear"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-gray-700 px-1">
                          <span className="text-[#0048d0]">{item.tag}</span>
                          <span className="text-gray-500 uppercase">{item.caption}</span>
                        </div>
                        {/* EXACT MIHARA BLUE HOVER OVERLAY (No text buttons) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0573d9]/65 to-[#05139f]/75 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      </Link>
                    )}

                    {/* CASE 5: TEE / SHIRT / BOTTOM / LOOKBOOK (Wide / Medium Product Showcases) */}
                    {(item.type === "tee" || item.type === "shirt" || item.type === "bottom" || item.type === "lookbook") && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (soundEnabled) playRetroTone("pop");
                        }}
                        className="block p-2 group/link relative overflow-hidden"
                      >
                        <div
                          className={`relative overflow-hidden bg-gray-100 border border-gray-200 ${
                            item.type === "bottom" ? "h-52" : item.type === "lookbook" ? "h-36" : "h-40 sm:h-44"
                          }`}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-gray-700 px-1">
                          {item.tag && <span className="text-[#0048d0] font-bold">{item.tag}</span>}
                          {item.caption && <span className="text-gray-500 uppercase text-[9px] truncate max-w-[160px]">{item.caption}</span>}
                        </div>
                        {/* EXACT MIHARA BLUE HOVER OVERLAY (No text buttons) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0573d9]/65 to-[#05139f]/75 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      </Link>
                    )}

                    {/* CASE 6: INSTAGRAM PROFILE WINDOW (Mihara's Instagram layout) */}
                    {item.type === "instagram" && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (soundEnabled) playRetroTone("pop");
                        }}
                        className="block p-3 text-black group/link relative overflow-hidden"
                      >
                        {/* Avatar & Header */}
                        <div className="flex items-center gap-3 pb-2.5 border-b border-gray-200">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden border border-white">
                              <img src="/logo.jpg" alt="paos.2hand" decoding="async" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs tracking-tight truncate">paos.2hand</span>
                              <span className="text-sky-500 text-xs font-bold">✓</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">50.8K người theo dõi • 179 bài viết</p>
                          </div>
                        </div>

                        {/* Story Highlights Circles */}
                        <div className="flex items-center justify-between pt-2 pb-2.5 border-b border-gray-100 text-center">
                          {[
                            { name: "New Drop", icon: "🔥" },
                            { name: "Áo phông", icon: "👕" },
                            { name: "Áo khoác", icon: "🧥" },
                            { name: "Feedback", icon: "⭐" },
                          ].map((st) => (
                            <div key={st.name} className="flex flex-col items-center gap-0.5">
                              <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center text-xs">
                                {st.icon}
                              </div>
                              <span className="text-[8px] font-mono text-gray-600 truncate max-w-[45px]">{st.name}</span>
                            </div>
                          ))}
                        </div>

                        {/* Follow Button */}
                        <div className="mt-2.5 w-full py-1.5 bg-[#0048d0] hover:bg-[#003bb0] text-white font-bold text-[11px] uppercase tracking-wider text-center shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                          <span>THEO DÕI TRÊN INSTAGRAM</span>
                          <span>↗</span>
                        </div>

                        {/* EXACT MIHARA BLUE HOVER OVERLAY (No text buttons) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0573d9]/65 to-[#05139f]/75 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FLOATING RETRO CONTROL DOCK (Bottom right) */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.5 }}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-neutral-900/95 backdrop-blur-md text-white px-3 py-2 border border-gray-700 shadow-[0_8px_24px_rgba(0,0,0,0.6)] text-xs font-mono"
      >
        <div className="flex items-center gap-1.5 pr-2 border-r border-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-300">
            {activeCount > 0 ? `${activeCount} CỬA SỔ` : "ĐÃ ĐÓNG"}
          </span>
        </div>

        {activeCount < visiblePopups.length && (
          <button
            type="button"
            onClick={reopenAll}
            className="flex items-center gap-1 bg-[#0048d0] hover:bg-blue-600 text-white font-bold px-2 py-1 text-[11px] uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            title="Mở lại toàn bộ cửa sổ pop-up"
          >
            <span>🗂</span>
            <span>Mở lại popups</span>
          </button>
        )}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={closeAll}
            className="text-gray-400 hover:text-white px-1.5 py-1 text-[11px] transition-colors cursor-pointer"
            title="Đóng tất cả cửa sổ pop-up"
          >
            Đóng tất cả
          </button>
        )}

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-1.5 py-1 text-[11px] transition-colors cursor-pointer ${
            soundEnabled ? "text-yellow-400" : "text-gray-500"
          }`}
          title={soundEnabled ? "Tắt âm thanh retro" : "Bật âm thanh retro"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </motion.div>
    </>
  );
}
