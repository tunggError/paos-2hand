"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", 
  "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", 
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", 
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", 
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", 
  "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", 
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", 
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", 
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", 
  "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", 
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');

  const shippingFee = province === 'Hà Nội' ? 25000 : (province ? 35000 : 0);
  const finalTotal = cartTotal + shippingFee;

  // Create VietQR URL
  const qrUrl = `https://img.vietqr.io/image/TCB-2107999999999-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent('Thanh toan Paos 2hand')}&accountName=NGUYEN%20THANH%20TUNG`;

  // Create Instagram pre-filled message
  const igMessage = encodeURIComponent(
    `Chào shop, mình chốt đơn qua Web:\n\n` +
    `Người nhận: ${name}\nSĐT: ${phone}\nĐịa chỉ: ${address}, ${province}\n\n` +
    `Sản phẩm:\n${cart.map((item, i) => `${i + 1}. ${item.name} (${item.price})`).join('\n')}\n\n` +
    `Tiền hàng: ${cartTotal.toLocaleString('vi-VN')}đ\n` +
    `Phí ship: ${shippingFee.toLocaleString('vi-VN')}đ\n` +
    `TỔNG CẦN TT: ${finalTotal.toLocaleString('vi-VN')}đ\n\n` +
    `(Mình đã quét QR thanh toán xong)`
  );
  
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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !province) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }
    setStep(2);
  };

  return (
    <div className="flex-1 bg-cream-100 py-12 px-4 text-gray-900">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center text-gray-900">Thanh Toán</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form & Summary */}
          <div className="space-y-8">
            {/* Form */}
            <div className={`bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 md:p-8 ${step === 2 ? 'opacity-70 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-6 border-b-4 border-gray-900 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900">1. Giao Hàng</h2>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="bg-gray-900 text-white text-xs font-black uppercase px-3 py-1 pointer-events-auto">
                    Sửa
                  </button>
                )}
              </div>
              
              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Họ và Tên</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Tên người nhận" className="w-full border-2 border-gray-900 p-3 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100" />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Số điện thoại</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại liên hệ" className="w-full border-2 border-gray-900 p-3 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100" />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Tỉnh / Thành phố</label>
                  <select required value={province} onChange={e => setProvince(e.target.value)} className="w-full border-2 border-gray-900 p-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100 appearance-none cursor-pointer">
                    <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Địa chỉ cụ thể</label>
                  <textarea required value={address} onChange={e => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện..." className="w-full border-2 border-gray-900 p-3 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100 h-24 resize-none" />
                </div>

                {step === 1 && (
                  <button type="submit" className="w-full bg-gray-900 text-white font-black uppercase tracking-widest py-4 border-2 border-transparent shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 hover:border-gray-900 transition-all mt-4">
                    Tiếp tục thanh toán &rarr;
                  </button>
                )}
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 md:p-8">
              <h2 className="text-2xl font-black uppercase tracking-widest mb-6 border-b-4 border-gray-900 pb-4 text-gray-900">Đơn hàng của bạn</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-cream-100 border-2 border-gray-900">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover border-2 border-gray-900" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm uppercase line-clamp-1 text-gray-900">{item.name}</h3>
                      <p className="font-black text-olive-600 mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-4 border-gray-900 pt-6 space-y-2">
                <div className="flex justify-between items-center text-gray-600 font-bold">
                  <span>Tiền hàng:</span>
                  <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 font-bold">
                  <span>Phí vận chuyển:</span>
                  <span>{province ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Chưa tính'}</span>
                </div>
                <div className="flex justify-between items-end pt-4 mt-4 border-t-2 border-dashed border-gray-300">
                  <span className="font-black uppercase tracking-widest text-lg text-gray-900">Tổng cộng:</span>
                  <span className="font-black text-4xl text-red-600">
                    {finalTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Section */}
          <div className="h-full">
            <div className={`bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 md:p-8 flex flex-col items-center text-center h-full ${step === 1 ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-2 text-gray-900">2. Quét Mã Thanh Toán</h2>
              
              {step === 1 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 border-4 border-gray-400 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400 font-black text-2xl">?</span>
                  </div>
                  <p className="font-bold text-gray-500 uppercase text-sm max-w-[200px]">Vui lòng điền thông tin giao hàng để xem mã QR</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-gray-900 mb-6 bg-cream-200 px-4 py-1 border-2 border-gray-900">Techcombank • NGUYEN THANH TUNG</p>
                  
                  <div className="w-64 h-64 border-4 border-gray-900 mb-6 p-2 bg-white relative">
                    <img src={qrUrl} alt="VietQR Code" className="w-full h-full object-contain" />
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white font-black px-3 py-1 border-2 border-gray-900 transform rotate-12">
                      Đã gộp phí ship!
                    </div>
                  </div>
                  
                  <div className="w-full space-y-4 mt-auto">
                    <p className="font-bold text-sm text-gray-600 bg-cream-100 p-3 border-2 border-gray-900">
                      Nội dung CK: <span className="text-gray-900 font-black">Thanh toan Paos 2hand</span>
                    </p>
                    <p className="font-bold text-sm text-gray-600">
                      Sau khi chuyển khoản thành công, hãy bấm nút bên dưới để gửi tin nhắn thông tin nhận hàng cho shop qua Instagram!
                    </p>
                    
                    <a 
                      href={igProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        navigator.clipboard.writeText(decodeURIComponent(igMessage));
                        alert("Đã copy toàn bộ thông tin! Vui lòng mở tin nhắn Instagram và dán (paste) gửi cho shop nhé.");
                      }}
                      className="block w-full bg-olive-600 text-white font-black uppercase tracking-widest py-4 border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 transition-all hover:translate-y-1 hover:shadow-none"
                    >
                      3. Đã CK - Nhắn tin cho Shop
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
