import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';
import { rateLimit } from '@/lib/rateLimit';
import { getAllProducts } from '@/lib/data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PAOS-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Parse a Vietnamese price string like "350.000đ" or "350000" → number */
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d]/g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

/** Strip HTML tags — basic XSS protection */
function sanitize(s: unknown): string {
  if (typeof s !== 'string') return '';
  return s.replace(/<[^>]*>/g, '').trim().slice(0, 300);
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // ── 1. Rate Limiting: max 5 checkout attempts per IP per hour ───────────
    const limited = await rateLimit(req, 'checkout', 5, 3600);
    if (limited) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
        { status: 429 }
      );
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { cart, customer, province } = body;

    // ── 2. Validate cart ─────────────────────────────────────────────────────
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
    }
    if (cart.length > 20) {
      return NextResponse.json({ error: 'Giỏ hàng vượt quá giới hạn' }, { status: 400 });
    }

    // ── 3. Validate customer fields ──────────────────────────────────────────
    const name = sanitize(customer?.name);
    const phone = sanitize(customer?.phone);
    const address = sanitize(customer?.address);
    const prov = sanitize(customer?.province ?? province);

    if (!name || !phone || !address || !prov) {
      return NextResponse.json({ error: 'Thiếu thông tin giao hàng' }, { status: 400 });
    }
    // Basic phone validation: 10-11 digits
    if (!/^[0-9]{9,11}$/.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    const ids: string[] = cart.map((item: any) => String(item.id));

    // ── 4. Re-calculate price SERVER-SIDE (never trust client total) ─────────
    //   Fetch all products from the authoritative source and look up each item.
    const allProducts = await getAllProducts();
    const productMap = new Map(allProducts.map(p => [p.id, p]));

    let serverCartTotal = 0;
    const verifiedCart: { id: string; name: string; price: string; image: string }[] = [];

    for (const clientItem of cart) {
      const serverProduct = productMap.get(clientItem.id);
      if (!serverProduct) {
        return NextResponse.json(
          { error: `Sản phẩm không tồn tại: ${clientItem.id}` },
          { status: 400 }
        );
      }
      if (serverProduct.isSold) {
        return NextResponse.json(
          { error: `Sản phẩm đã được bán: ${serverProduct.name}` },
          { status: 409 }
        );
      }
      serverCartTotal += parsePrice(serverProduct.price);
      verifiedCart.push({
        id: serverProduct.id,
        name: serverProduct.name,
        price: serverProduct.price,   // Always use server price
        image: serverProduct.image,
      });
    }

    // Calculate shipping fee server-side
    const shippingFee = prov === 'Hà Nội' ? 25000 : 35000;
    const total = serverCartTotal + shippingFee;

    const now = Date.now();
    const expireTime = now + 15 * 60 * 1000; // 15 minutes

    // ── 5. Check product availability / lock conflicts ───────────────────────
    await redis.zremrangebyscore('locked_products', '-inf', now);
    const currentlyLocked = await redis.zrangebyscore('locked_products', now, '+inf');
    const conflicts = ids.filter(id => currentlyLocked.includes(id));
    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Sản phẩm đã bị người khác đặt trước!', conflicts },
        { status: 409 }
      );
    }

    // ── 6. Create order & lock items ─────────────────────────────────────────
    const orderId = generateOrderId();
    const orderData = {
      orderId,
      customer: { name, phone, address, province: prov },
      cart: verifiedCart,
      shippingFee,
      total,
      status: 'PENDING',
      createdAt: now,
      expireTime,
    };

    const pipeline = redis.pipeline();
    ids.forEach(id => pipeline.zadd('locked_products', expireTime, id));
    pipeline.hset('orders', orderId, JSON.stringify(orderData));
    await pipeline.exec();

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, orderId, expireTime, total, shippingFee });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
