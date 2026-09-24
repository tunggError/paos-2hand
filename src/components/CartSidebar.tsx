"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, cartTotal, removeFromCart } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-cream-100 z-[101] shadow-2xl border-l-4 border-gray-900 flex flex-col"
          >
            <div className="p-6 border-b-4 border-gray-900 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900">Giỏ Hàng ({cart.length})</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] hover:bg-red-600 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <p className="font-black text-xl mb-2 uppercase">Trống trơn</p>
                  <p>Hãy lướt xem đồ và chọn món bạn thích nhé!</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white border-2 border-gray-900 p-3 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] relative">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover border-2 border-gray-900" />
                    <div className="flex-1 flex flex-col justify-center pr-8">
                      <h3 className="font-bold text-sm uppercase line-clamp-2 leading-tight mb-2 text-gray-900">{item.name}</h3>
                      <p className="font-black text-olive-600">{item.price}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t-4 border-gray-900">
                <div className="flex justify-between items-center mb-6 text-gray-900">
                  <span className="font-black uppercase tracking-wider">Tổng cộng:</span>
                  <span className="font-black text-2xl">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center bg-olive-600 text-white font-black uppercase tracking-widest py-4 border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 hover:text-white transition-all hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]"
                >
                  Thanh Toán Ngay
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
