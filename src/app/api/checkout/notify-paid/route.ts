import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sendTelegramOrderNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis chưa sẵn sàng' }, { status: 500 });
    }

    const orderStr = await redis.hget('orders', orderId);
    if (!orderStr) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const order = JSON.parse(orderStr as string);

    // Send Telegram Notification in background
    sendTelegramOrderNotification(order, 'CUSTOMER_PAID_REPORT').catch(err => {
      console.error('Failed to send Telegram paid report:', err);
    });

    return NextResponse.json({ success: true, message: 'Đã thông báo tới shop qua Telegram' });
  } catch (error: any) {
    console.error('Error in notify-paid route:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
