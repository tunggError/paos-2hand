import { redis } from './redis';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

/**
 * Retrieve Telegram Bot configuration:
 * Checks Redis first (dynamic admin override), falls back to environment variables.
 */
export async function getTelegramConfig(): Promise<TelegramConfig> {
  let botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_CHAT_ID || '';
  let enabled = true;

  if (redis) {
    try {
      const configStr = await redis.get('telegram_bot_config');
      if (configStr) {
        const parsed = JSON.parse(configStr);
        if (parsed.botToken) botToken = parsed.botToken;
        if (parsed.chatId) chatId = parsed.chatId;
        if (typeof parsed.enabled === 'boolean') enabled = parsed.enabled;
      }
    } catch (err) {
      console.error('Error fetching Telegram config from Redis:', err);
    }
  }

  return {
    botToken: botToken.trim(),
    chatId: chatId.trim(),
    enabled: enabled && !!botToken && !!chatId,
  };
}

/**
 * Save Telegram configuration to Redis
 */
export async function saveTelegramConfig(config: TelegramConfig): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('telegram_bot_config', JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Error saving Telegram config to Redis:', err);
    return false;
  }
}

/**
 * Send a raw message via Telegram Bot API
 */
export async function sendTelegramMessage(text: string, customConfig?: { botToken?: string; chatId?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getTelegramConfig();
    const token = customConfig?.botToken || config.botToken;
    const chat = customConfig?.chatId || config.chatId;

    if (!token || !chat) {
      return { success: false, error: 'Chưa cấu hình Bot Token hoặc Chat ID' };
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('Telegram API error:', data);
      let desc = data.description || 'Lỗi gửi tin nhắn Telegram';
      if (desc.toLowerCase().includes('chat not found')) {
        desc = 'Lỗi "chat not found": Bạn chưa bấm nút "START" với bot trên Telegram!\n\n👉 Cách khắc phục:\n1. Mở link chat với bot: https://t.me/Paos2handBot (hoặc tìm username bot của bạn)\n2. Bấm nút START ở dưới cùng màn hình chat\n3. Sau đó quay lại đây bấm "Gửi Thử Tin Nhắn Test" là thành công ngay!';
      }
      return { success: false, error: desc };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send Telegram message:', err);
    return { success: false, error: err.message || 'Lỗi kết nối tới Telegram' };
  }
}

/**
 * Format and send an order notification to Telegram for packing/shipping
 */
export async function sendTelegramOrderNotification(
  order: {
    orderId: string;
    customer: { name: string; phone: string; address: string; province: string };
    cart: { id: string; name: string; price: string; image?: string }[];
    total: number;
    shippingFee?: number;
    status: string;
    createdAt?: number;
  },
  type: 'NEW_ORDER' | 'CUSTOMER_PAID_REPORT' | 'ADMIN_PAID_CONFIRMED'
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getTelegramConfig();
    if (!config.enabled) {
      return { success: false, error: 'Telegram bot chưa được bật' };
    }

    const formatCurrency = (amount: number) => {
      return amount.toLocaleString('vi-VN') + 'đ';
    };

    const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    let header = '';
    let statusBadge = '';

    if (type === 'NEW_ORDER') {
      header = '🔔 <b>ĐƠN HÀNG MỚI ĐẶT — CHỜ CHUYỂN KHOẢN</b>';
      statusBadge = '⏳ Đang chờ thanh toán (Giữ đồ 15p)';
    } else if (type === 'CUSTOMER_PAID_REPORT') {
      header = '💸 <b>KHÁCH BÁO ĐÃ CHUYỂN KHOẢN XONG!</b>';
      statusBadge = '⚠️ CẦN CHECK TÀI KHOẢN & GÓI HÀNG';
    } else if (type === 'ADMIN_PAID_CONFIRMED') {
      header = '🎉 <b>ĐƠN HÀNG ĐÃ XÁC NHẬN THANH TOÁN THÀNH CÔNG!</b>';
      statusBadge = '✅ ĐÃ THU TIỀN — SẴN SÀNG GÓI HÀNG 📦';
    }

    const itemsList = order.cart
      .map((item, index) => {
        return `   <b>${index + 1}.</b> ${item.name}\n      💰 Giá: <code>${item.price}</code>\n      🔗 Link ảnh: <a href="${item.image || '#'}">Xem ảnh đồ</a>`;
      })
      .join('\n\n');

    const totalItemsPrice = order.cart.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/\D/g, ''), 10) || 0;
      return sum + priceNum;
    }, 0);

    const message = `
${header}
━━━━━━━━━━━━━━━━━━━━
📦 <b>MÃ ĐƠN HÀNG:</b> <code>${order.orderId}</code>
🕒 <b>Thời gian:</b> ${dateStr}
🏷 <b>Trạng thái:</b> <b>${statusBadge}</b>

👤 <b>THÔNG TIN NGƯỜI NHẬN HÀNG:</b>
• <b>Họ tên:</b> ${order.customer.name}
• <b>Số điện thoại:</b> <code>${order.customer.phone}</code> (📞 <a href="tel:${order.customer.phone}">Bấm để gọi</a>)
• <b>Địa chỉ:</b> ${order.customer.address}, ${order.customer.province}

👕 <b>DANH SÁCH ĐỒ CẦN NHẶT / GÓI (${order.cart.length} món):</b>
${itemsList}

💵 <b>TIỀN HÀNG:</b> ${formatCurrency(totalItemsPrice)}
🚚 <b>PHÍ SHIP:</b> ${formatCurrency(order.shippingFee || 0)} (${order.customer.province})
━━━━━━━━━━━━━━━━━━━━
💰 <b>TỔNG TIỀN PHẢI THU:</b> <b>${formatCurrency(order.total)}</b>
━━━━━━━━━━━━━━━━━━━━
👉 <i>Đăng nhập trang quản trị để duyệt đơn hoặc cập nhật trạng thái gói hàng!</i>
    `.trim();

    return await sendTelegramMessage(message);
  } catch (err: any) {
    console.error('Error in sendTelegramOrderNotification:', err);
    return { success: false, error: err.message };
  }
}
