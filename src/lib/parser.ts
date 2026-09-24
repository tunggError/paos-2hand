export function parseInstagramCaption(caption: string) {
  let name = "Sản phẩm Pao's 2hand";
  let condition = "9/10";
  let measurements = { n: 0, d: 0 };
  let description = "";
  let price = "Liên hệ";
  let isSold = false;
  let isAnnouncement = false;

  if (!caption) return { name, condition, measurements, description, price, isSold, isAnnouncement };

  if (caption.toLowerCase().includes('sold')) {
    isSold = true;
  }

  const captionLower = caption.toLowerCase();
  if (captionLower.includes('new drop') || captionLower.includes('drop mới') || (!captionLower.includes('cond:') && !captionLower.includes('giá:'))) {
    isAnnouncement = true;
  }

  const lines = caption.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length > 0) {
    name = lines[0].replace(/paos\.2hand/i, '').trim();
    if (name.startsWith('-')) name = name.substring(1).trim();
    if (name === '') name = "Sản phẩm Pao's 2hand";
  }

  const descLines = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.toLowerCase().startsWith('cond:')) {
      condition = line.substring(5).trim();
      continue;
    }
    
    if (line.includes('N:') || line.includes('D:')) {
      const matchN = line.match(/N:\s*(\d+)/i);
      const matchD = line.match(/D:\s*(\d+)/i);
      if (matchN) measurements.n = parseInt(matchN[1]);
      if (matchD) measurements.d = parseInt(matchD[1]);
      continue;
    }
    
    if (line.toLowerCase().startsWith('giá:')) {
      let rawPrice = line.substring(4).trim();
      // Loại bỏ các icon (emoji)
      rawPrice = rawPrice.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      
      const numMatch = rawPrice.match(/^(\d+)$/);
      if (numMatch) {
        let numStr = numMatch[1];
        if (numStr.length === 2 || numStr.length === 3) {
          price = `${numStr}.000đ`;
        } else if (numStr.length === 4) {
          let millions = numStr[0];
          let thousands = numStr.substring(1);
          price = `${millions}.${thousands}.000đ`;
        } else {
          price = rawPrice;
        }
      } else {
        price = rawPrice;
        if (price.toLowerCase() === 'ib') price = 'Liên hệ';
      }
      continue;
    }

    if (!line.startsWith('#')) {
      descLines.push(line);
    }
  }

  description = descLines.join(' ');

  // For announcements, we just use the raw caption as description and don't care about name
  if (isAnnouncement) {
    name = "Thông báo từ Pao's 2hand";
    description = caption;
  }

  return { name, condition, measurements, description, price, isSold, isAnnouncement };
}
