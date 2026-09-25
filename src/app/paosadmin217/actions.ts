"use server";

import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';

export async function setProductOverride(id: string, override: { price?: string; isSold?: boolean; name?: string }) {
  const cookieStore = await cookies();
  if (cookieStore.get('paos_admin_session')?.value !== 'authenticated') throw new Error("Unauthorized");
  if (!redis) throw new Error("Database not connected");
  
  const current = await redis.hget('product_overrides', id);
  const currentData = current ? JSON.parse(current) : {};
  const newData = { ...currentData, ...override };
  
  await redis.hset('product_overrides', id, JSON.stringify(newData));
  
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

export async function uploadImage(formData: FormData) {
  const cookieStore = await cookies();
  if (cookieStore.get('paos_admin_session')?.value !== 'authenticated') throw new Error("Unauthorized");
  
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return blob.url;
}

export async function addManualProduct(product: { 
  id: string; 
  name: string; 
  price: string; 
  image: string; 
  images?: string[];
  isSold: boolean;
  description?: string;
  condition?: string;
  measurements?: { n: number; d: number };
}) {
  const cookieStore = await cookies();
  if (cookieStore.get('paos_admin_session')?.value !== 'authenticated') throw new Error("Unauthorized");
  if (!redis) throw new Error("Database not connected");
  
  await redis.lpush('manual_products', JSON.stringify(product));
  
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

export async function deleteManualProduct(id: string) {
  const cookieStore = await cookies();
  if (cookieStore.get('paos_admin_session')?.value !== 'authenticated') throw new Error("Unauthorized");
  if (!redis) throw new Error("Database not connected");
  
  const products = await redis.lrange('manual_products', 0, -1);
  for (const p of products) {
    const parsed = JSON.parse(p);
    if (parsed.id === id) {
      await redis.lrem('manual_products', 0, p);
      break;
    }
  }
  
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

import { cookies } from 'next/headers';

export async function loginAction(password: string) {
  if (password === 'paos2026') {
    const cookieStore = await cookies();
    cookieStore.set('paos_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Sai mật khẩu' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('paos_admin_session');
}
