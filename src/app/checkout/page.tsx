"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const { cart, cartTotal, clearCart, pendingOrder, setPendingOrder, clearPendingOrder } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  
  const [isLocking, setIsLocking] = useState(false);
  const [lockExpireTime, setLockExpireTime] = useState<number | null>(null);
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(900); // 15 mins default
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    if (pendingOrder) {
      setStep(2);
      setOrderId(pendingOrder.orderId);
      setLockExpireTime(pendingOrder.expireTime);
      if (pendingOrder.customer) {
        setName(pendingOrder.customer.name);
        setPhone(pendingOrder.customer.phone);
        setAddress(pendingOrder.customer.address);
        setProvince(pendingOrder.customer.province);
      }
    }
  }, [pendingOrder]);

  useEffect(() => {
    if (step === 2 && lockExpireTime) {
      const interval = setInterval(() => {
        const remaining = lockExpireTime - Date.now();
        if (remaining <= 0) {
          clearInterval(interval);
          alert("Hết thời gian giữ hàng (15 phút). Giỏ hàng của bạn đã bị hủy.");
          clearCart();
          clearPendingOrder();
          window.location.href = '/';
        } else {
          setLockTimeLeft(Math.floor(remaining / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, lockExpireTime, clearCart, clearPendingOrder]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const shippingFee = province === 'Hà Nội' ? 25000 : (province ? 35000 : 0);
  const finalTotal = pendingOrder ? pendingOrder.total : cartTotal + shippingFee;

  // Create VietQR URL using orderId
  const qrUrl = `https://img.vietqr.io/image/TCB-2107999999999-compact2.png?amount=${finalTotal}&addInfo=${orderId}&accountName=NGUYEN%20THANH%20TUNG`;

  // Create Instagram pre-filled message
  const igMessage = pendingOrder ? pendingOrder.igMessage : encodeURIComponent(
    `Chào shop, mình đã CK đơn hàng: ${orderId}\n\n` +
    `Người nhận: ${name}\nSĐT: ${phone}\nĐịa chỉ: ${address}, ${province}\n\n` +
    `Sản phẩm:\n${cart.map((item, i) => `${i + 1}. ${item.name} (${item.price})`).join('\n')}\n\n` +
    `TỔNG ĐÃ TT: ${finalTotal.toLocaleString('vi-VN')}đ`
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

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !province) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setIsLocking(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cart, 
          customer: { name, phone, address, province },
          shippingFee,
          total: finalTotal
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Có lỗi xảy ra, một số sản phẩm đã bị người khác giữ trước.");
        return;
      }
      
      setOrderId(data.orderId);
      setLockExpireTime(data.expireTime);
      setPendingOrder({
        orderId: data.orderId,
        expireTime: data.expireTime,
        total: finalTotal,
        shippingFee: shippingFee,
        igMessage: igMessage,
        customer: { name, phone, address, province }
      });
      setStep(2);
      router.refresh(); // Force client cache to update so homepage shows TẠM GIỮ instantly
    } catch (err) {
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="flex-1 bg-cream-100 py-12 px-4 text-gray-900">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center text-gray-900">Thanh Toán</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="h-full">
            <div className={`bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 flex flex-col h-full ${step === 2 ? 'opacity-70 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-6 border-b-4 border-gray-900 pb-4 shrink-0">
                <h2 className="text-xl font-black uppercase tracking-widest text-gray-900">1. Giao Hàng</h2>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="bg-gray-900 text-white text-xs font-black uppercase px-3 py-1 pointer-events-auto">
                    Sửa
                  </button>
                )}
              </div>
              
              <form onSubmit={handleContinue} className="space-y-4 flex-1 flex flex-col">
                <div>
                  <label className="block font-bold text-gray-900 text-xs mb-1 uppercase">Họ và Tên</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Tên người nhận" className="w-full border-2 border-gray-900 p-2.5 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100 text-sm" />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 text-xs mb-1 uppercase">Số điện thoại</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại liên hệ" className="w-full border-2 border-gray-900 p-2.5 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100 text-sm" />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 text-xs mb-1 uppercase">Tỉnh / Thành phố</label>
                  <select required value={province} onChange={e => setProvince(e.target.value)} className="w-full border-2 border-gray-900 p-2.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100 appearance-none cursor-pointer text-sm">
                    <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-gray-900 text-xs mb-1 uppercase">Địa chỉ cụ thể</label>
                  <textarea required value={address} onChange={e => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện..." className="w-full border-2 border-gray-900 p-2.5 font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-600 bg-cream-100 h-full min-h-[80px] resize-none text-sm" />
                </div>

                {step === 1 && (
                  <button type="submit" disabled={isLocking} className="w-full bg-gray-900 text-white font-black uppercase tracking-widest py-3 border-2 border-transparent shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 hover:border-gray-900 transition-all mt-4 shrink-0 text-sm disabled:opacity-50">
                    {isLocking ? 'Đang xử lý...' : 'Tiếp tục thanh toán \u2192'}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Column 2: Order Summary */}
          <div className="h-full">
            <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 flex flex-col h-full">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 border-b-4 border-gray-900 pb-4 text-gray-900 shrink-0">Đơn hàng của bạn</h2>
              
              <div className="space-y-3 mb-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 p-2.5 bg-cream-100 border-2 border-gray-900">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover border-2 border-gray-900" />
                    <div className="flex-1">
                      <h3 className="font-bold text-xs uppercase line-clamp-2 text-gray-900 leading-tight">{item.name}</h3>
                      <p className="font-black text-olive-600 mt-1 text-sm">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-4 border-gray-900 pt-4 space-y-2 shrink-0">
                <div className="flex justify-between items-center text-gray-600 font-bold text-sm">
                  <span>Tiền hàng:</span>
                  <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 font-bold text-sm">
                  <span>Phí vận chuyển:</span>
                  <span>{(pendingOrder ? pendingOrder.shippingFee : shippingFee) > 0 ? `${(pendingOrder ? pendingOrder.shippingFee : shippingFee).toLocaleString('vi-VN')}đ` : 'Chưa tính'}</span>
                </div>
                <div className="flex justify-between items-end pt-3 mt-3 border-t-2 border-dashed border-gray-300">
                  <span className="font-black uppercase tracking-widest text-gray-900">Tổng cộng:</span>
                  <span className="font-black text-2xl md:text-3xl text-red-600">
                    {finalTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Payment Section */}
          <div className="h-full">
            <div className={`bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-6 flex flex-col items-center text-center h-full ${step === 1 ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2 text-gray-900 shrink-0">2. Quét Mã Thanh Toán</h2>
              
              {step === 1 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 border-4 border-gray-400 rounded-full flex items-center justify-center mb-3">
                    <span className="text-gray-400 font-black text-xl">?</span>
                  </div>
                  <p className="font-bold text-gray-500 uppercase text-xs max-w-[180px]">Vui lòng điền thông tin giao hàng để xem mã QR</p>
                </div>
              ) : (
                <>
                  <div className="w-full bg-orange-100 border-2 border-orange-500 p-2 mb-4 shrink-0">
                    <p className="font-bold text-orange-600 text-xs uppercase">Sản phẩm đang được tạm giữ trong:</p>
                    <p className="font-black text-orange-700 text-2xl tracking-widest">{formatTime(lockTimeLeft)}</p>
                  </div>
                  <p className="font-bold text-gray-900 mb-4 bg-cream-200 px-3 py-1 border-2 border-gray-900 text-xs shrink-0">Techcombank • NGUYEN THANH TUNG</p>
                  
                  <div className="w-48 h-48 sm:w-56 sm:h-56 border-4 border-gray-900 mb-4 p-2 bg-white relative shrink-0">
                    <img src={qrUrl} alt="VietQR Code" className="w-full h-full object-contain" />
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white font-black px-2 py-1 border-2 border-gray-900 transform rotate-12 text-[10px]">
                      Đã gộp phí ship!
                    </div>
                  </div>
                  
                  <div className="w-full space-y-3 mt-auto">
                    <p className="font-bold text-xs text-gray-600 bg-cream-100 p-2 border-2 border-gray-900">
                      Mã đơn hàng (ND CK): <span className="text-olive-700 font-black text-lg block">{orderId}</span>
                    </p>
                    <p className="font-bold text-xs text-gray-600 leading-tight">
                      Sau khi chuyển khoản, hãy bấm nút bên dưới để gửi tin nhắn thông tin nhận hàng cho shop qua Instagram!
                    </p>
                    
                    <a 
                      href={igProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        const messageToCopy = pendingOrder ? pendingOrder.igMessage : igMessage;
                        navigator.clipboard.writeText(decodeURIComponent(messageToCopy));
                        alert("Đã copy toàn bộ thông tin! Vui lòng mở tin nhắn Instagram và dán (paste) gửi cho shop nhé.");
                      }}
                      className="block w-full bg-olive-600 text-white font-black uppercase tracking-widest py-3 border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 transition-all hover:translate-y-1 hover:shadow-none text-xs"
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
