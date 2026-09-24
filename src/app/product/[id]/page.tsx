import { getAllProducts } from '@/lib/data';
import ProductGallery from '@/components/ProductGallery';
import ProductPageActions from '@/components/ProductPageActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Use cached getAllProducts instead of individual API fetch for instant loading
  const allProducts = await getAllProducts();
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  const { name, condition, measurements, description, price, isSold, isLocked, image, images, post } = product;
  const displayImages = images && images.length > 0 ? images : [image];
  const permalink = post?.permalink || '#';

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
            <ProductGallery images={displayImages} />
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
              {!isSold && isLocked && (
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm uppercase tracking-wider">
                  Tạm Giữ
                </span>
              )}
              <span className="bg-olive-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm">
                Độ mới: {condition}
              </span>
              <span className="bg-cream-200 text-olive-800 px-4 py-2 rounded-full font-bold text-sm">
                Kích thước: Ngang {measurements?.n || 0}cm - Dài {measurements?.d || 0}cm
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
              <ProductPageActions
                id={id}
                name={name}
                price={price}
                image={displayImages[0]}
                isSold={isSold}
                isLocked={isLocked}
                isContactOnly={price.toLowerCase().includes('liên hệ')}
                permalink={permalink}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
