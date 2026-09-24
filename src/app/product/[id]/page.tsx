import { getInstagramPost } from '@/lib/instagram';
import { parseInstagramCaption } from '@/lib/parser';
import ProductGallery from '@/components/ProductGallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getInstagramPost(id);

  if (!post) {
    notFound();
  }

  const { name, condition, measurements, description, price, isSold } = parseInstagramCaption(post.caption);

  // Collect images
  let images = [post.media_url];
  if (post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.data) {
    images = post.children.data.map(child => child.media_url);
  }

  return (
    <div className="bg-cream-100 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/#products" className="text-olive-600 hover:text-olive-700 font-bold flex items-center gap-2 transition-colors">
            &larr; Quay lại cửa hàng
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-cream-200 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Left: Gallery */}
          <div className="w-full">
            <ProductGallery images={images} />
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
              {name}
            </h1>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {isSold && (
                <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm uppercase tracking-wider">
                  Đã Bán
                </span>
              )}
              <span className="bg-olive-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm">
                Độ mới: {condition}
              </span>
              <span className="bg-cream-200 text-olive-800 px-4 py-2 rounded-full font-bold text-sm">
                Kích thước: Ngang {measurements.n}cm - Dài {measurements.d}cm
              </span>
            </div>

            <div className="mb-8 pb-8 border-b border-cream-200">
              <span className={`text-4xl font-black ${isSold ? 'text-gray-400 line-through' : 'text-olive-600'}`}>
                {price}
              </span>
            </div>

            <div className="prose max-w-none mb-10 text-gray-600 whitespace-pre-wrap leading-relaxed">
              <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">Chi tiết sản phẩm</h3>
              <p>{description}</p>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              {isSold ? (
                <div className="w-full bg-gray-300 text-gray-600 text-center py-4 rounded-xl font-bold text-lg cursor-not-allowed uppercase tracking-widest shadow-inner">
                  Sản phẩm đã hết hàng
                </div>
              ) : (
                <a 
                  href={post.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-olive-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-olive-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Nhắn tin mua hàng qua IG
                </a>
              )}
              <button disabled className="w-full bg-cream-200 text-gray-500 text-center py-4 rounded-xl font-bold text-lg cursor-not-allowed opacity-70">
                Thêm vào giỏ hàng (Sắp ra mắt)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
