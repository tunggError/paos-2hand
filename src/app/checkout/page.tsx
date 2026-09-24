"use client";

import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();

  // Create VietQR URL
  const qrUrl = `https://img.vietqr.io/image/TCB-2107999999999-compact2.png?amount=${cartTotal}&addInfo=${encodeURIComponent('Thanh toan Paos 2hand')}&accountName=NGUYEN%20THANH%20TUNG`;

  // Create Instagram pre-filled message
  const igMessage = encodeURIComponent(
    `Chào shop, mình muốn chốt các sản phẩm sau:\n\n${cart.map((item, i) => `${i + 1}. ${item.name} (${item.price})`).join('\n')}\n\nTổng cộng: ${cartTotal.toLocaleString('vi-VN')}đ\n(Mình đã quét mã QR thanh toán trên web)`
  );
  
  // Instagram URL for Paos 2hand (Using instagram.com/paos.2hand)
  const igUrl = `https://ig.me/m/paos.2hand?text=${igMessage}`;
  // For web, sometimes ig.me doesn't work well without app installed, so we can also fallback to ig profile
  const igProfile = `https://instagram.com/paos.2hand`;

  if (cart.length === 0) {
    return (
      <div className="flex-1 bg-cream-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-10 text-center max-w-md w-full">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Giỏ hàng trống</h1>
          <p className="font-medium text-gray-600 mb-8">Bạn chưa chọn món đồ nào để thanh toán.</p>
          <Link 
            href="/products" 
            className="inline-block bg-olive-600 text-white font-black uppercase tracking-widest px-8 py-3 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 transition-colors"
          >
            Đi mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-cream-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center">Thanh Toán</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 md:p-8">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-6 border-b-4 border-gray-900 pb-4">Đơn hàng của bạn</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-cream-100 border-2 border-gray-900">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover border-2 border-gray-900" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase line-clamp-1">{item.name}</h3>
                    <p className="font-black text-olive-600 mt-1">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t-4 border-gray-900 pt-6">
              <div className="flex justify-between items-end">
                <span className="font-black uppercase tracking-widest text-lg">Tổng thanh toán:</span>
                <span className="font-black text-4xl text-red-600">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 md:p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Quét Mã Thanh Toán</h2>
            <p className="font-bold text-gray-500 mb-6 bg-cream-200 px-4 py-1 border-2 border-gray-900">Techcombank • NGUYEN THANH TUNG</p>
            
            <div className="w-64 h-64 border-4 border-gray-900 mb-6 p-2 bg-white relative">
              <img src={qrUrl} alt="VietQR Code" className="w-full h-full object-contain" />
              <div className="absolute -top-3 -right-3 bg-red-600 text-white font-black px-3 py-1 border-2 border-gray-900 transform rotate-12">
                Tự động điền số tiền!
              </div>
            </div>
            
            <div className="w-full space-y-4 mt-auto">
              <p className="font-bold text-sm text-gray-600">
                Sau khi chuyển khoản thành công, hãy bấm nút bên dưới để gửi tin nhắn xác nhận cho shop qua Instagram nhé!
              </p>
              
              <a 
                href={igProfile}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Copy tin nhắn vào clipboard để khách dễ dán vào IG
                  navigator.clipboard.writeText(decodeURIComponent(igMessage));
                  alert("Đã copy tin nhắn giỏ hàng! Vui lòng dán (paste) vào tin nhắn trên Instagram cho shop nhé.");
                }}
                className="block w-full bg-olive-600 text-white font-black uppercase tracking-widest py-4 border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 transition-all hover:translate-y-1 hover:shadow-none"
              >
                1. Đã CK - Nhắn tin cho Shop
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
