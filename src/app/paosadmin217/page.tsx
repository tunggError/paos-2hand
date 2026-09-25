import { getAllProducts } from '@/lib/data';
import AdminClient from './AdminClient';
import { cookies } from 'next/headers';

export const revalidate = 60;

export default async function AdminPage() {
  const products = await getAllProducts();
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('paos_admin_session')?.value === 'authenticated';

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black uppercase tracking-widest text-gray-900 mb-8 border-b-4 border-gray-900 pb-4">
          PAOS.2HAND ADMIN
        </h1>
        
        <AdminClient initialProducts={products} serverAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
