import ProductCard from '@/components/ProductCard';
import { getAllProducts, ProductCategory } from '@/lib/data';
import Link from 'next/link';

export const revalidate = 60;

const CATEGORY_META: Record<string, { title: string; subtitle: string; icon: string }> = {
  all: {
    title: 'Tất Cả Sản Phẩm',
    subtitle: 'Khám phá trọn bộ sưu tập 2hand tuyển chọn của Paos.2hand',
    icon: '✦',
  },
  tee: {
    title: 'Áo Phông & Áo Thun',
    subtitle: 'Áo phông, áo thun vintage, polo graphic streetwear tuyển chọn chất lượng cao',
    icon: '👕',
  },
  shirt: {
    title: 'Áo Sơ Mi',
    subtitle: 'Áo sơ mi vintage, flannel, oxford, cuban collar và sơ mi họa tiết tuyển chọn',
    icon: '👔',
  },
  outerwear: {
    title: 'Áo Khoác & Hoodie',
    subtitle: 'Áo gió, hoodie, bomber, áo phao lông vũ, gile và jacket đường phố',
    icon: '🧥',
  },
  bottom: {
    title: 'Quần & Jeans',
    subtitle: 'Quần jean denim, kaki vintage, jogger, cargo và quần âu tuyển chọn',
    icon: '👖',
  },
  accessory: {
    title: 'Phụ Kiện',
    subtitle: 'Mũ, nón, túi xách và phụ kiện streetwear độc đáo',
    icon: '🧢',
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const allData = await getAllProducts();
  const allProducts = allData.filter((item) => !item.isAnnouncement);

  const resolvedParams = await searchParams;
  const currentCategory = (typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all').toLowerCase();
  const pageStr = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';
  const page = parseInt(pageStr) || 1;

  // 1. Calculate counts for all categories
  const counts = {
    all: allProducts.length,
    tee: allProducts.filter((p) => p.category === 'tee').length,
    shirt: allProducts.filter((p) => p.category === 'shirt').length,
    outerwear: allProducts.filter((p) => p.category === 'outerwear').length,
    bottom: allProducts.filter((p) => p.category === 'bottom').length,
    accessory: allProducts.filter((p) => p.category === 'accessory').length,
  };

  // 2. Filter products based on selected category
  const filteredProducts =
    currentCategory && currentCategory !== 'all'
      ? allProducts.filter((p) => p.category === currentCategory)
      : allProducts;

  // 3. Pagination
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const meta = CATEGORY_META[currentCategory] || CATEGORY_META.all;

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'TẤT CẢ', count: counts.all, href: '/products' },
    { key: 'tee', label: 'ÁO PHÔNG / THUN', count: counts.tee, href: '/products?category=tee' },
    { key: 'shirt', label: 'ÁO SƠ MI', count: counts.shirt, href: '/products?category=shirt' },
    { key: 'outerwear', label: 'ÁO KHOÁC', count: counts.outerwear, href: '/products?category=outerwear' },
    { key: 'bottom', label: 'QUẦN', count: counts.bottom, href: '/products?category=bottom' },
    ...(counts.accessory > 0
      ? [{ key: 'accessory', label: 'PHỤ KIỆN', count: counts.accessory, href: '/products?category=accessory' }]
      : []),
  ];

  return (
    <div className="bg-cream-100 min-h-screen pt-10 pb-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* HEADER & TITLE */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-olive-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] mb-4">
            <span>{meta.icon}</span>
            <span>PAOS.2HAND SELECTION</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter mb-3">
            {meta.title}
          </h1>

          <p className="text-gray-700 text-base md:text-lg max-w-2xl mx-auto font-medium">
            {meta.subtitle}
          </p>
        </div>

        {/* CATEGORY FILTER TABS (Brutalist style with counts) */}
        <div className="mb-12 flex flex-wrap justify-center items-center gap-2 md:gap-3">
          {tabs.map((tab) => {
            const isActive = currentCategory === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`group flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-150 border-2 border-gray-900 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-[4px_4px_0px_0px_rgba(87,98,70,1)] translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-cream-200 hover:-translate-y-0.5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] md:text-xs px-2 py-0.5 font-mono font-bold rounded-none border ${
                    isActive
                      ? 'bg-yellow-400 text-black border-black'
                      : 'bg-cream-200 text-gray-800 border-gray-900 group-hover:bg-white'
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] max-w-xl mx-auto p-8">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">
              Chưa có sản phẩm trong mục này
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Shop đang liên tục cập nhật thêm hàng mới. Bạn có thể xem các danh mục khác hoặc toàn bộ sản phẩm.
            </p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white font-black text-xs uppercase tracking-widest px-6 py-3 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(87,98,70,1)] hover:bg-olive-600 transition-colors"
            >
              Xem tất cả sản phẩm &rarr;
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  condition={item.condition || '9/10'}
                  measurements={item.measurements || { n: 0, d: 0 }}
                  description={item.description || 'Hàng 2hand tuyển chọn.'}
                  price={item.price}
                  image={item.image}
                  images={item.images}
                  isSold={item.isSold}
                  permalink={item.post?.permalink}
                />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t-2 border-gray-300">
                {page > 1 && (
                  <Link
                    href={`/products?${currentCategory !== 'all' ? `category=${currentCategory}&` : ''}page=${page - 1}`}
                    className="bg-white text-gray-900 px-6 py-2.5 font-black uppercase tracking-widest border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 hover:text-white transition-colors text-xs md:text-sm"
                  >
                    &larr; Trang trước
                  </Link>
                )}

                <span className="font-mono font-bold text-gray-800 text-sm bg-white px-4 py-2 border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                  Trang {page} / {totalPages}
                </span>

                {page < totalPages && (
                  <Link
                    href={`/products?${currentCategory !== 'all' ? `category=${currentCategory}&` : ''}page=${page + 1}`}
                    className="bg-white text-gray-900 px-6 py-2.5 font-black uppercase tracking-widest border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 hover:text-white transition-colors text-xs md:text-sm"
                  >
                    Trang sau &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
