import { NextResponse } from 'next/server';
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
