import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
    }

    const now = Date.now();
    const expireTime = now + 15 * 60 * 1000; // 15 minutes lock

    // Clean up expired locks first
    await redis.zremrangebyscore('locked_products', '-inf', now);

    // Check if any of the requested items are already locked
    const currentlyLocked = await redis.zrangebyscore('locked_products', now, '+inf');
    
    const conflicts = ids.filter(id => currentlyLocked.includes(id));
    if (conflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Some items are already locked by another user',
        conflicts 
      }, { status: 409 });
    }

    // Lock all requested items
    const pipeline = redis.pipeline();
    ids.forEach(id => {
      pipeline.zadd('locked_products', expireTime, id);
    });
    await pipeline.exec();

    return NextResponse.json({ success: true, expireTime });
  } catch (error) {
    console.error('Lock API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Auto-cleanup endpoint — called by Vercel Cron every minute
// Removes expired product locks from Redis and marks PENDING orders as EXPIRED
// Then revalidates the Next.js cache so the homepage reflects the unlocked status immediately
export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const now = Date.now();

    // 1. Remove expired product locks from the sorted set
    const removed = await redis.zremrangebyscore('locked_products', '-inf', now);

    // 2. Find PENDING orders whose 15-minute window has passed and mark them EXPIRED
    const ordersHash = await redis.hgetall('orders');
    let expiredCount = 0;

    if (ordersHash) {
      const updates: Record<string, string> = {};
      for (const [orderId, orderStr] of Object.entries(ordersHash)) {
        const order = JSON.parse(orderStr as string);
        if (order.status === 'PENDING' && order.expireTime < now) {
          order.status = 'EXPIRED';
          updates[orderId] = JSON.stringify(order);
          expiredCount++;
        }
      }
      if (Object.keys(updates).length > 0) {
        await redis.hset('orders', updates);
      }
    }

    // 3. If anything changed, revalidate all cached pages so UI updates immediately
    if (removed > 0 || expiredCount > 0) {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({ 
      success: true, 
      removedLocks: removed, 
      expiredOrders: expiredCount,
      timestamp: new Date(now).toISOString()
    });
  } catch (error) {
    console.error('Cleanup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
