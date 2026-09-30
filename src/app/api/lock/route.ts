import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';
import { rateLimit } from '@/lib/rateLimit';

// ─── POST /api/lock — lock products during checkout ───────────────────────────
// Rate limited: 10 requests per IP per hour to prevent "lock the whole store" attacks.

export async function POST(req: Request) {
  try {
    // Rate limit: 10 lock requests per IP per hour
    const limited = await rateLimit(req, 'lock', 10, 3600);
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
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
    }

    // Prevent locking too many items in one request (abuse prevention)
    if (ids.length > 20) {
      return NextResponse.json({ error: 'Too many product IDs' }, { status: 400 });
    }

    // Validate each ID is a non-empty string (prevent injection)
    const safeIds: string[] = ids
      .map((id: unknown) => (typeof id === 'string' ? id.trim() : ''))
      .filter(id => id.length > 0 && id.length <= 100);

    if (safeIds.length === 0) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 });
    }

    const now = Date.now();
    const expireTime = now + 15 * 60 * 1000; // 15 minutes

    await redis.zremrangebyscore('locked_products', '-inf', now);
    const currentlyLocked = await redis.zrangebyscore('locked_products', now, '+inf');

    const conflicts = safeIds.filter(id => currentlyLocked.includes(id));
    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Some items are already locked by another user', conflicts },
        { status: 409 }
      );
    }

    const pipeline = redis.pipeline();
    safeIds.forEach(id => pipeline.zadd('locked_products', expireTime, id));
    await pipeline.exec();

    return NextResponse.json({ success: true, expireTime });
  } catch (error) {
    console.error('Lock API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── GET /api/lock — auto-cleanup (Vercel Cron) ───────────────────────────────
// Protected by CRON_SECRET header to prevent unauthorized cache invalidation.

export async function GET(req: Request) {
  try {
    // Verify Vercel/cron caller via secret header
    const secret = req.headers.get('x-cron-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || secret !== cronSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const now = Date.now();

    // 1. Remove expired product locks
    const removed = await redis.zremrangebyscore('locked_products', '-inf', now);

    // 2. Find PENDING orders that timed out and mark them EXPIRED
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

    if (removed > 0 || expiredCount > 0) {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      success: true,
      removedLocks: removed,
      expiredOrders: expiredCount,
      timestamp: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error('Cleanup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
