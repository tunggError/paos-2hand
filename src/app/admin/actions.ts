"use server";

import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';

export async function setProductOverride(id: string, override: { price?: string; isSold?: boolean; name?: string }) {
  if (!redis) throw new Error("Database not connected");
  
  const current = await redis.hget('product_overrides', id);
  const currentData = current ? JSON.parse(current) : {};
  const newData = { ...currentData, ...override };
  
  await redis.hset('product_overrides', id, JSON.stringify(newData));
  
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

export async function addManualProduct(product: { id: string; name: string; price: string; image: string; isSold: boolean }) {
  if (!redis) throw new Error("Database not connected");
  
  await redis.lpush('manual_products', JSON.stringify(product));
  
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

export async function deleteManualProduct(id: string) {
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
