import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-cream-100 border-t border-cream-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-olive-600/30 shadow-sm relative">
                <Image src="/logo.jpg" alt="Pao's 2hand Logo" fill className="object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-black uppercase">
                Paos<span className="text-olive-600">.2hand</span>
              </span>
            </div>
            <p className="text-olive-700 max-w-sm mb-6">
              Nơi tìm kiếm những món đồ 2hand chất lượng, được tuyển chọn kỹ lưỡng. Chúng tôi mang đến cho bạn phong cách độc đáo với mức giá hợp lý.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/paos.2hand" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 shadow-sm hover:text-olive-600 hover:shadow-md transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Liên kết</h4>
            <ul className="space-y-3 text-sm text-olive-700">
              <li><a href="/" className="hover:text-olive-600 transition-colors">Trang chủ</a></li>
              <li><a href="/products" className="hover:text-olive-600 transition-colors">Sản phẩm</a></li>
              <li><a href="/about" className="hover:text-olive-600 transition-colors">Về chúng tôi</a></li>
              <li><a href="/contact" className="hover:text-olive-600 transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Chính sách</h4>
            <ul className="space-y-3 text-sm text-olive-700">
              <li><a href="#" className="hover:text-olive-600 transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-olive-600 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-olive-600 transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-olive-600 transition-colors">Hướng dẫn mua hàng</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cream-200 mt-12 pt-8 text-center text-sm text-olive-700">
          <p>&copy; {new Date().getFullYear()} Paos 2hand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
