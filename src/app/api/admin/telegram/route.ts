import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getTelegramConfig, saveTelegramConfig, sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getTelegramConfig();

    // Mask bot token for security in UI: 123456...abcd
    let maskedToken = '';
    let botUsername = '';
    let botFirstName = '';

    if (config.botToken) {
      if (config.botToken.length > 10) {
        maskedToken = config.botToken.slice(0, 6) + '...' + config.botToken.slice(-4);
      } else {
        maskedToken = '******';
      }

      try {
        const meRes = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
        const meData = await meRes.json();
        if (meData.ok && meData.result) {
          botUsername = meData.result.username || '';
          botFirstName = meData.result.first_name || '';
        }
      } catch (err) {}
    }

    return NextResponse.json({
      configured: !!config.botToken && !!config.chatId,
      enabled: config.enabled,
      chatId: config.chatId,
      maskedToken,
      botUsername,
      botFirstName,
      hasEnvToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasEnvChatId: !!process.env.TELEGRAM_CHAT_ID,
    });
  } catch (error) {
    console.error('Error fetching Telegram config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, botToken, chatId, enabled } = body;

    // Action 1: Test Connection
    if (action === 'TEST') {
      const current = await getTelegramConfig();
      const testToken = (botToken && botToken.trim()) || current.botToken;
      const testChatId = (chatId && chatId.trim()) || current.chatId;

      if (!testToken || !testChatId) {
        return NextResponse.json(
          { error: 'Vui lòng nhập Bot Token và Chat ID trước khi test!' },
          { status: 400 }
        );
      }

      const testMsg = `
🤖 <b>[PAOS 2HAND] KẾT NỐI TELEGRAM BOT THÀNH CÔNG!</b>
━━━━━━━━━━━━━━━━━━━━
Chào bạn, đây là tin nhắn kiểm tra từ hệ thống website <b>Paos 2Hand</b>.

✅ <b>Bot Token:</b> Đã xác thực
✅ <b>Chat ID:</b> <code>${testChatId}</code>
🕒 <b>Thời gian test:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}

Từ bây giờ, mỗi khi có khách hàng thanh toán hoặc tạo đơn hàng mới, data đầy đủ (tên, SĐT, địa chỉ, danh sách áo/quần cần nhặt, tiền ship, tổng tiền) sẽ được tự động đổ trực tiếp về Telegram này để bạn gói hàng nhanh chóng! 📦🚀
      `.trim();

      const result = await sendTelegramMessage(testMsg, { botToken: testToken, chatId: testChatId });
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Lỗi gửi tin nhắn test' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Đã gửi tin nhắn test thành công! Hãy kiểm tra Telegram của bạn.' });
    }

    // Action 2: Save Config
    if (action === 'SAVE') {
      const current = await getTelegramConfig();
      const newBotToken = botToken !== undefined ? botToken.trim() : current.botToken;
      const newChatId = chatId !== undefined ? chatId.trim() : current.chatId;
      const newEnabled = enabled !== undefined ? !!enabled : current.enabled;

      const success = await saveTelegramConfig({
        botToken: newBotToken,
        chatId: newChatId,
        enabled: newEnabled,
      });

      if (!success) {
        return NextResponse.json({ error: 'Không thể lưu vào Redis' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Đã lưu cấu hình Telegram thành công!' });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling Telegram admin API:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
