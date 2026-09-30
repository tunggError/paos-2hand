import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';
import { isAdminAuthenticated } from '@/lib/auth';

// ─── GET /api/admin/orders — list all orders ──────────────────────────────────

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const ordersHash = await redis.hgetall('orders');
    if (!ordersHash) {
      return NextResponse.json({ orders: [] });
    }

    const orders = Object.values(ordersHash).map((orderStr: any) => JSON.parse(orderStr));
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ─── POST /api/admin/orders — update order status ─────────────────────────────

const ALLOWED_ACTIONS = new Set(['PAID', 'CANCELLED', 'DELETE'] as const);
type OrderAction = 'PAID' | 'CANCELLED' | 'DELETE';

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, action } = body;

    // Validate inputs strictly — never trust raw body
    if (typeof orderId !== 'string' || !orderId.match(/^PAOS-[A-Z0-9]{6}$/)) {
      return NextResponse.json({ error: 'Invalid orderId format' }, { status: 400 });
    }
    if (!ALLOWED_ACTIONS.has(action as OrderAction)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const orderStr = await redis.hget('orders', orderId);
    if (!orderStr) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = JSON.parse(orderStr as string);

    if (action === 'PAID') {
      order.status = 'PAID';
      for (const item of order.cart) {
        const existingOverrideStr = await redis.hget('product_overrides', item.id);
        const override = existingOverrideStr ? JSON.parse(existingOverrideStr as string) : {};
        override.isSold = true;
        await redis.hset('product_overrides', { [item.id]: JSON.stringify(override) });
        await redis.zrem('locked_products', item.id);
      }
    } else if (action === 'CANCELLED') {
      order.status = 'CANCELLED';
      for (const item of order.cart) {
        await redis.zrem('locked_products', item.id);
      }
    } else if (action === 'DELETE') {
      await redis.hdel('orders', orderId);
      return NextResponse.json({ success: true, message: 'Deleted' });
    }

    await redis.hset('orders', { [orderId]: JSON.stringify(order) });
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
