import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PAOS-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { cart, customer, shippingFee, total } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
    }

    const ids = cart.map(item => item.id);
    const now = Date.now();
    const expireTime = now + 15 * 60 * 1000; // 15 minutes lock

    // Clean up expired locks first
    await redis.zremrangebyscore('locked_products', '-inf', now);

    // Check if any of the requested items are already locked
    const currentlyLocked = await redis.zrangebyscore('locked_products', now, '+inf');
    
    const conflicts = ids.filter(id => currentlyLocked.includes(id));
    if (conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Sản phẩm đã bị người khác đặt trước đó vài giây!',
        conflicts 
      }, { status: 409 });
    }

    // Generate Order ID
    const orderId = generateOrderId();

    const orderData = {
      orderId,
      customer,
      cart,
      shippingFee,
      total,
      status: 'PENDING',
      createdAt: now,
      expireTime
    };

    // Lock all requested items & Save Order
    const pipeline = redis.pipeline();
    ids.forEach(id => {
      pipeline.zadd('locked_products', expireTime, id);
    });
    
    // Save order details to an 'orders' hash map
    pipeline.hset('orders', orderId, JSON.stringify(orderData));
    
    await pipeline.exec();

    // Force instant UI update across all cached pages
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, orderId, expireTime });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
