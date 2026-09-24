import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-gray-900 bg-cream-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] relative">
            <Image src="/logo.jpg" alt="Pao's 2hand Logo" fill className="object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-black uppercase">
            Paos<span className="text-olive-600">.2hand</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-black text-sm uppercase tracking-widest">
          <Link href="/" className="text-gray-900 hover:text-olive-600 transition-colors">Trang chủ</Link>
          <Link href="/products" className="text-gray-900 hover:text-olive-600 transition-colors">Sản phẩm</Link>
          <Link href="/about" className="text-gray-900 hover:text-olive-600 transition-colors">Về chúng tôi</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-900 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 hover:text-white transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-gray-900 text-white text-[10px] font-black flex items-center justify-center">0</span>
          </button>
        </div>
      </div>
    </header>
  );
}
