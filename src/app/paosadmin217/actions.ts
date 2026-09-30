"use server";

import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { cookies, headers } from 'next/headers';
import { createSessionToken, isAdminAuthenticated, SESSION_COOKIE } from '@/lib/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Throw if caller is not a verified admin. */
async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) throw new Error('Unauthorized');
}

/** Strip HTML tags and trim — basic XSS prevention for text fields. */
function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

// ─── Auth Actions ─────────────────────────────────────────────────────────────

export async function loginAction(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD env variable is not set!');
    return { success: false, error: 'Cấu hình máy chủ lỗi' };
  }

  // Rate limit: 5 login attempts per IP per 15 minutes
  if (redis) {
    const headerStore = await headers();
    const ip =
      headerStore.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerStore.get('x-real-ip') ||
      'unknown';
    const key = `rl:login:${ip}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, '-inf', now - windowMs);
    pipeline.zadd(key, now, `${now}`);
    pipeline.zcard(key);
    pipeline.expire(key, 15 * 60 + 1);
    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;
    if (count > 5) {
      return { success: false, error: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' };
    }
  }

  // Constant-time comparison to prevent timing attacks
  const inputBytes = Buffer.from(password);
  const secretBytes = Buffer.from(adminPassword);
  const match =
    inputBytes.length === secretBytes.length &&
    inputBytes.every((b, i) => b === secretBytes[i]);

  if (!match) {
    await new Promise(r => setTimeout(r, 300));
    return { success: false, error: 'Sai mật khẩu' };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─── Product Actions (all require admin) ──────────────────────────────────────

export async function setProductOverride(
  id: string,
  override: { price?: string; isSold?: boolean; name?: string }
) {
  await requireAdmin();
  if (!redis) throw new Error('Database not connected');

  // Sanitize inputs
  const safeOverride: { price?: string; isSold?: boolean; name?: string } = {};
  if (override.name !== undefined) safeOverride.name = sanitizeText(override.name);
  if (override.price !== undefined) safeOverride.price = sanitizeText(override.price);
  if (typeof override.isSold === 'boolean') safeOverride.isSold = override.isSold;

  const current = await redis.hget('product_overrides', id);
  const currentData = current ? JSON.parse(current) : {};
  const newData = { ...currentData, ...safeOverride };

  await redis.hset('product_overrides', id, JSON.stringify(newData));

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

export async function uploadImage(formData: FormData) {
  await requireAdmin();

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  // Only allow image files
  if (!file.type.startsWith('image/')) {
    throw new Error('Chỉ chấp nhận file ảnh');
  }

  // Limit to 10 MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File quá lớn (tối đa 10MB)');
  }

  const blob = await put(file.name, file, { access: 'public' });
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
  await requireAdmin();
  if (!redis) throw new Error('Database not connected');

  // Sanitize all text fields before persisting
  const safeProduct = {
    ...product,
    name: sanitizeText(product.name),
    price: sanitizeText(product.price),
    description: product.description ? sanitizeText(product.description) : undefined,
    condition: product.condition ? sanitizeText(product.condition) : undefined,
  };

  await redis.lpush('manual_products', JSON.stringify(safeProduct));

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
}

export async function deleteManualProduct(id: string) {
  await requireAdmin();
  if (!redis) throw new Error('Database not connected');

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
