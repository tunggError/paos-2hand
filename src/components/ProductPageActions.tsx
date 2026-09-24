"use client";

import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

interface ProductPageActionsProps {
  id: string;
  name: string;
  price: string;
  image: string;
  isSold: boolean;
  isLocked?: boolean;
  isContactOnly: boolean;
  permalink?: string;
}

export default function ProductPageActions({
  id,
  name,
  price,
  image,
  isSold,
  isLocked,
  isContactOnly,
  permalink
}: ProductPageActionsProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (isSold || isLocked) return;
    addToCart({ id, name, price, image });
  };

  if (isSold) {
    return (
      <div className="w-full bg-gray-300 text-gray-600 text-center py-4 rounded-xl font-bold text-lg cursor-not-allowed uppercase tracking-widest shadow-inner">
        Sản phẩm đã hết hàng
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="w-full bg-orange-200 text-orange-800 text-center py-4 rounded-xl font-bold text-lg cursor-not-allowed uppercase tracking-widest shadow-inner">
        Sản phẩm đang được người khác giữ
      </div>
    );
  }

  if (isContactOnly) {
    return (
      <a 
        href={permalink || 'https://instagram.com/paos.2hand'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full bg-olive-600 text-white text-center py-4 font-black text-xl hover:bg-olive-700 transition-colors flex items-center justify-center gap-3 uppercase tracking-widest border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        LIÊN HỆ MUA QUA IG
      </a>
    );
  }

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAddToCart}
      className="w-full bg-olive-600 text-white text-center py-4 font-black text-xl hover:bg-olive-700 transition-colors flex items-center justify-center gap-3 uppercase tracking-widest border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      THÊM VÀO GIỎ HÀNG
    </motion.button>
  );
}
