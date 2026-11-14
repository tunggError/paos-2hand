"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { cart, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDarkHeader = isHome && !isScrolled;

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        isDarkHeader
          ? 'bg-black/85 backdrop-blur-md text-white border-b border-white/20'
          : 'bg-cream-100 text-gray-900 border-b-4 border-gray-900 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-10 h-10 overflow-hidden border-2 relative transition-all ${
            isDarkHeader ? 'border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]' : 'border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]'
          }`}>
            <Image src="/logo.jpg" alt="Pao's 2hand Logo" fill className="object-cover" />
          </div>
          <span className={`text-2xl font-black tracking-tighter uppercase ${isDarkHeader ? 'text-white' : 'text-black'}`}>
            Paos<span className="text-olive-600">.2hand</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-black text-sm uppercase tracking-widest">
          <Link href="/" className={`${isDarkHeader ? 'text-gray-200 hover:text-white' : 'text-gray-900 hover:text-olive-600'} transition-colors`}>Trang chủ</Link>
          <Link href="/products" className={`${isDarkHeader ? 'text-gray-200 hover:text-white' : 'text-gray-900 hover:text-olive-600'} transition-colors`}>Sản phẩm</Link>
          <Link href="/about" className={`${isDarkHeader ? 'text-gray-200 hover:text-white' : 'text-gray-900 hover:text-olive-600'} transition-colors`}>Về chúng tôi</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`p-2 border-2 transition-colors relative cursor-pointer ${
              isDarkHeader
                ? 'text-white bg-neutral-900 border-white hover:bg-white hover:text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-gray-900 bg-white border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-gray-900 text-white text-[10px] font-black flex items-center justify-center">
              {cart.length}
            </span>
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 border-2 focus:outline-none cursor-pointer ${
              isDarkHeader
                ? 'text-white bg-neutral-900 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]'
                : 'text-gray-900 bg-white border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className={`md:hidden absolute top-16 left-0 w-full flex flex-col font-black text-base uppercase tracking-widest p-4 gap-3 z-50 border-b-4 ${
          isDarkHeader
            ? 'bg-neutral-950/95 border-white text-white'
            : 'bg-cream-100 border-gray-900 text-gray-900'
        }`}>
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="border-b border-current/20 pb-2">Trang chủ</Link>
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className="border-b border-current/20 pb-2">Tất cả sản phẩm</Link>
          <div className="flex flex-col gap-2 pl-4 text-xs font-mono font-bold border-b border-current/20 pb-2">
            <Link href="/products?category=tee" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-400">👕 Áo phông / thun</Link>
            <Link href="/products?category=shirt" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-400">👔 Áo sơ mi</Link>
            <Link href="/products?category=outerwear" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-400">🧥 Áo khoác & hoodie</Link>
            <Link href="/products?category=bottom" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-400">👖 Quần & jeans</Link>
          </div>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="pb-1">Về chúng tôi</Link>
        </div>
      )}
    </header>
  );
}
