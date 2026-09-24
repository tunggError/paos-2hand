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
