import ProductCard from '@/components/ProductCard';
import AnnouncementCard from '@/components/AnnouncementCard';
import Hero from '@/components/Hero';
import { getInstagramPosts } from '@/lib/instagram';
import { parseInstagramCaption } from '@/lib/parser';
import Link from 'next/link';

export const revalidate = 3600; // Cache page for 1 hour, auto-rebuild

export default async function Home() {
  const posts = await getInstagramPosts(24); // Lấy 24 bài viết mới nhất

  const parsedPosts = posts
    .filter(p => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
    .map(post => {
      const parsed = parseInstagramCaption(post.caption);
      return { post, parsed };
    });

  const announcements = parsedPosts.filter(item => item.parsed.isAnnouncement);
  const products = parsedPosts.filter(item => !item.parsed.isAnnouncement).slice(0, 8); // Chỉ lấy 8 sản phẩm cho trang chủ

  return (
    <div className="bg-cream-100 flex-grow">
        <Hero />

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <section className="py-16 px-4 bg-white/50">
            <div className="container mx-auto max-w-5xl">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Bản Tin & Drop Mới</h2>
                <p className="text-gray-900 font-bold uppercase tracking-widest bg-olive-600 text-white inline-block px-4 py-1 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">Cập nhật lịch release và các bộ sưu tập sắp lên kệ</p>
              </div>
              <div className="flex flex-col gap-8">
                {announcements.map(({ post, parsed }) => (
                  <AnnouncementCard
                    key={post.id}
                    id={post.id}
                    description={parsed.description}
                    image={post.media_url}
                    timestamp={post.timestamp}
                    permalink={post.permalink}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section id="products" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-4 border-b-4 border-gray-900 gap-4">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Hàng Mới Về</h2>
                <p className="text-gray-900 font-bold uppercase tracking-widest bg-cream-200 inline-block px-4 py-1 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] mt-2">Những món đồ 2hand tuyển chọn vừa cập bến</p>
              </div>
              <Link href="/products" className="hidden md:inline-block bg-white text-gray-900 font-black uppercase tracking-widest px-6 py-2 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 hover:text-white transition-colors">
                Xem tất cả &rarr;
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">Chưa tải được sản phẩm hoặc không có bài viết nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(({ post, parsed }) => (
                  <ProductCard 
                    key={post.id}
                    id={post.id}
                    name={parsed.name}
                    condition={parsed.condition}
                    measurements={parsed.measurements}
                    description={parsed.description}
                    price={parsed.price}
                    image={post.media_url}
                    isSold={parsed.isSold}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center md:hidden">
              <Link href="/products" className="inline-block bg-white text-gray-900 font-black uppercase tracking-widest px-8 py-4 border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 hover:text-white transition-colors">
                Xem tất cả sản phẩm
              </Link>
            </div>
          </div>
        </section>
    </div>
  );
}
