import { getAllProducts } from '@/lib/data';
import AdminClient from './AdminClient';

export const revalidate = 0; // Always fetch fresh data for admin

export default async function AdminPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-8 border-b-4 border-gray-900 pb-4">
          PAOS.2HAND ADMIN
        </h1>
        
        <AdminClient initialProducts={products} />
      </div>
    </div>
  );
}
