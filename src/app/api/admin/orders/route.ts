import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const ordersHash = await redis.hgetall('orders');
    
    if (!ordersHash) {
      return NextResponse.json({ orders: [] });
    }

    // Convert hash values to array and parse JSON
    const orders = Object.values(ordersHash).map((orderStr: any) => JSON.parse(orderStr));
    
    // Sort by createdAt descending
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const { orderId, action } = await request.json();
    if (!orderId || !action) {
      return NextResponse.json({ error: 'Missing orderId or action' }, { status: 400 });
    }

    const orderStr = await redis.hget('orders', orderId);
    if (!orderStr) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = JSON.parse(orderStr as string);

    if (action === 'PAID') {
      order.status = 'PAID';
      
      // Update overrides to mark as sold
      for (const item of order.cart) {
        const existingOverrideStr = await redis.hget('product_overrides', item.id);
        const override = existingOverrideStr ? JSON.parse(existingOverrideStr as string) : {};
        override.isSold = true;
        await redis.hset('product_overrides', { [item.id]: JSON.stringify(override) });
        // Remove from locked_products
        await redis.zrem('locked_products', item.id);
      }
    } else if (action === 'CANCELLED') {
      order.status = 'CANCELLED';
      // Release the locks
      for (const item of order.cart) {
        await redis.zrem('locked_products', item.id);
      }
    }

    // Save order back
    await redis.hset('orders', { [orderId]: JSON.stringify(order) });
    
    // Revalidate paths so the website updates instantly
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
