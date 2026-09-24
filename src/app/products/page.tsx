import ProductCard from '@/components/ProductCard';
import { getAllProducts } from '@/lib/data';

export const revalidate = 60;

export default async function ProductsPage() {
  const allData = await getAllProducts();

  const products = allData.filter(item => !item.isAnnouncement);

  return (
    <div className="bg-cream-100 min-h-screen pt-12 pb-24 px-4">
      <div className="container mx-auto">
        <div className="mb-12 border-b border-cream-200 pb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-olive-700 uppercase tracking-tight mb-4">
            Tất Cả Sản Phẩm
          </h1>
          <p className="text-olive-600/80 text-lg">
            Khám phá trọn bộ sưu tập 2hand tuyển chọn của chúng tôi
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">Chưa tải được sản phẩm hoặc không có bài viết nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <ProductCard 
                key={item.id}
                id={item.id}
                name={item.name}
                condition={item.condition || "9/10"}
                measurements={item.measurements || {n: 0, d: 0}}
                description={item.description || "Hàng 2hand tuyển chọn."}
                price={item.price}
                image={item.image}
                images={item.images}
                isSold={item.isSold}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
