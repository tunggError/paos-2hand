import MiharaHero from '@/components/MiharaHero';
import { getAllProducts } from '@/lib/data';

export const revalidate = 60; 

export default async function Home() {
  const allData = await getAllProducts();
  
  const announcements = allData.filter(item => item.isAnnouncement);
  const products = allData.filter(item => !item.isAnnouncement); // Truyền toàn bộ sản phẩm cho các ô popup

  return (
    <div className="bg-black flex-grow flex flex-col">
      {/* TRANG CHỦ CHỈ HIỆN HERO PHONG CÁCH MIHARA VỚI POP-UP SẢN PHẨM & INSTAGRAM */}
      <MiharaHero products={products} announcements={announcements} />
    </div>
  );
}
