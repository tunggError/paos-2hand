export type ProductCategory = 'tee' | 'shirt' | 'outerwear' | 'bottom' | 'accessory';

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export const SHIRT_TAGS = new Set([
  'aosomi', 'somi', 'shirt', 'chemise', 'oxford', 'flannel', 'hawaiian'
]);

export const OUTERWEAR_TAGS = new Set([
  'aokhoac', 'khoac', 'hoodie', 'jacket', 'bomber', 'aophao', 'phao', 'gile',
  'aogio', 'gio', 'cardigan', 'sweater', 'varsity', 'blouson', 'parka', 'longvu',
  'mangto', 'blazer', 'coat', 'windbreaker'
]);

export const BOTTOM_TAGS = new Set([
  'quan', 'quanjean', 'quankaki', 'quanshort', 'quandai', 'quannhon', 'quandui',
  'quanau', 'quanjogger', 'jean', 'jeans', 'kaki', 'khaki', 'denim', 'jogger',
  'short', 'shorts', 'pants', 'trousers'
]);

export const TEE_TAGS = new Set([
  'aophong', 'phong', 'aothun', 'thun', 'tee', 'tshirt',
  'polo', 'aopolo', 'tanktop', 'croptop', 'top'
]);

export const ACCESSORY_TAGS = new Set([
  'phukien', 'acc', 'accessory', 'accessories', 'mu', 'non', 'mubucket',
  'muluoitrai', 'beanie', 'cap', 'tui', 'tuixach', 'tuideocheo', 'bag',
  'balo', 'backpack', 'thatlung', 'belt', 'khan', 'vi', 'wallet', 'giay', 'sneaker'
]);

export function extractHashtags(caption: string): string[] {
  const tags = new Set<string>();
  if (!caption) return [];

  // 1. Standard or punctuated hashtags: #áo.khoác, #áo_phông, #quần, #aophong, #ao.khoac, #aosomi, etc.
  const hashRegex = /#([^\s#,;!]+)/gu;
  let match: RegExpExecArray | null;
  while ((match = hashRegex.exec(caption)) !== null) {
    const raw = match[1];
    const normalized = removeVietnameseTones(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) tags.add(normalized);
  }

  // 2. Multi-word hashtag edge cases: e.g. '#áo sơ mi', '#ao so mi', '#áo phông', '#ao khoac', '#áo. khoác'
  const shirtRegex = /#\s*(áo|ao)?\s*[\._\s]*(sơ\s*mi|so\s*mi|shirt|oxford|flannel)/giu;
  while ((match = shirtRegex.exec(caption)) !== null) {
    const raw = match[0].replace(/^#\s*/, '');
    const normalized = removeVietnameseTones(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) tags.add(normalized);
  }

  const teeRegex = /#\s*(áo|ao)\s*[\._\s]*(phông|phong|thun)/giu;
  while ((match = teeRegex.exec(caption)) !== null) {
    const raw = match[0].replace(/^#\s*/, '');
    const normalized = removeVietnameseTones(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) tags.add(normalized);
  }

  const outerwearRegex = /#\s*(áo|ao)\s*[\._\s]*(khoác|khoac|phao|gió|gio)/giu;
  while ((match = outerwearRegex.exec(caption)) !== null) {
    const raw = match[0].replace(/^#\s*/, '');
    const normalized = removeVietnameseTones(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) tags.add(normalized);
  }

  const bottomRegex = /#\s*(quần|quan)\s*[\._\s]*(jean|jeans|kaki|dài|dai|short|shorts|đùi|dui|jogger)?/giu;
  while ((match = bottomRegex.exec(caption)) !== null) {
    const raw = match[0].replace(/^#\s*/, '');
    const normalized = removeVietnameseTones(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) tags.add(normalized);
  }

  const accRegex = /#\s*(phụ\s*kiện|phu\s*kien)/giu;
  while ((match = accRegex.exec(caption)) !== null) {
    const raw = match[0].replace(/^#\s*/, '');
    const normalized = removeVietnameseTones(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized) tags.add(normalized);
  }

  return Array.from(tags);
}

export function detectCategory(name: string, caption: string = ""): ProductCategory {
  // PRIORITY 1: Hashtags in caption (Instagram tags set by owner)
  const hashtags = extractHashtags(caption);
  for (const tag of hashtags) {
    if (SHIRT_TAGS.has(tag)) return 'shirt';
    if (OUTERWEAR_TAGS.has(tag)) return 'outerwear';
    if (BOTTOM_TAGS.has(tag)) return 'bottom';
    if (TEE_TAGS.has(tag)) return 'tee';
    if (ACCESSORY_TAGS.has(tag)) return 'accessory';
  }

  // PRIORITY 2: Fallback heuristic keyword detection on name & caption text
  const text = (name + " " + caption).toLowerCase();
  const nameLower = name.toLowerCase();

  // 1. Sơ mi / Shirt
  if (/sơ mi|somi|shirt|flannel|chemise|oxford/i.test(nameLower)) {
    return 'shirt';
  }

  // 2. Quần (Bottoms: Jeans, Kaki, Joggers, Shorts)
  const isBottom =
    /quần|jean|jeans|denim|kaki|khaki|jogger|short|shorts|lệ vi|levi|501|504|505|511|skinny|suông|ống rộng|chôm hớt/i.test(nameLower) ||
    /\bquần\b|dáng skinny|slim fit nhật|dáng suông|ống rộng/i.test(text);
  if (isBottom && !/khoác|jacket|áo/i.test(nameLower)) {
    return 'bottom';
  }

  // 3. Áo khoác (Outerwear: Jackets, Hoodies, Bombers, Windbreakers, Puffer, Gile, Sweaters, etc.)
  const isOuterwear =
    /khoác|bomber|gile|phao|hoodie|\bhd\b|gió|jacket|varsity|blouson|parka|lông vũ|trượt tuyết|chần bông|sweater|nỉ|cardigan/i.test(nameLower) ||
    /khoác|bomber|gile|phao|hoodie|\bhd\b|gió|jacket|lông vũ|trượt tuyết|chần bông|mặc ấm|mũ giấu|tay áo tháo|2 mặt/i.test(text);
  if (isOuterwear) {
    return 'outerwear';
  }

  // 4. Phụ kiện (Accessories: Hats, Caps, Bags, Belts, Shoes)
  const isAccessory =
    /\bmũ\b|nón|\bcap\b|beanie|túi|\bbag\b|balo|backpack|thắt lưng|\bbelt\b|khăn|\bví\b|wallet|giày|sneaker/i.test(nameLower);
  if (isAccessory) {
    return 'accessory';
  }

  // 5. Mặc định: Áo phông / Áo thun (Tee / Tops / Polo)
  return 'tee';
}

export function parsePriceString(raw: string): string {
  if (!raw) return "Liên hệ";
  
  // 1. Loại bỏ icon/emoji và khoảng trắng thừa
  let str = raw
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .trim();

  // Bỏ các từ chú thích như sold, hết hàng
  str = str.replace(/sold/gi, "").trim();

  if (/^(ib|inbox|lh|lien he|liên hệ)$/i.test(str)) {
    return "Liên hệ";
  }

  function formatVnd(amount: number): string {
    return amount.toLocaleString("vi-VN") + "đ";
  }

  // 1. Trường hợp giá đã có dấu chấm/phẩy đầy đủ (VD: 1.000.000đ, 450.000đ, 350.000)
  const fullDigits = str.replace(/[^\d]/g, "");
  if ((str.includes(".") || str.includes(",")) && fullDigits.length >= 5 && !/(?:m|tr|k)\b/i.test(str)) {
    const val = parseInt(fullDigits, 10);
    if (!isNaN(val) && val > 0) {
      return formatVnd(val);
    }
  }

  // 2. Ký hiệu tiền triệu có phần lẻ: VD '1m5' (1.500.000đ), '1m2' (1.200.000đ), '1m25' (1.250.000đ), '1tr5', '2m1'
  const mSuffixMatch = str.match(/^(\d+)\s*(?:m|tr)\s*(\d+)/i);
  if (mSuffixMatch) {
    const main = parseInt(mSuffixMatch[1], 10);
    const subStr = mSuffixMatch[2];
    const subPadded = (subStr + "000000").substring(0, 6);
    const sub = parseInt(subPadded, 10);
    const total = main * 1000000 + sub;
    return formatVnd(total);
  }

  // 3. Ký hiệu tiền triệu tròn hoặc số thập phân: VD '1m' (1.000.000đ), '2m', '1.5m', '1,5m', '1tr', '1.2tr', '1 triệu'
  const mDecimalMatch = str.match(/^(\d+(?:[\.,]\d+)?)\s*(?:m|tr|triệu|trieu)\b/i);
  if (mDecimalMatch) {
    const num = parseFloat(mDecimalMatch[1].replace(",", "."));
    const total = Math.round(num * 1000000);
    return formatVnd(total);
  }

  // 4. Ký hiệu nghìn với 'k': VD '250k', '1000k', '1200k'
  const kMatch = str.match(/^(\d+(?:[\.,]\d+)?)\s*k\b/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(",", "."));
    const total = Math.round(num * 1000);
    return formatVnd(total);
  }

  // 5. Số nguyên thuần: VD '50' -> 50.000đ, '250' -> 250.000đ, '1200' -> 1.200.000đ
  const numPrefixMatch = str.match(/^(\d+)/);
  if (numPrefixMatch) {
    const numStr = numPrefixMatch[1];
    if (numStr.length === 2 || numStr.length === 3) {
      return `${numStr}.000đ`;
    } else if (numStr.length === 4) {
      const millions = numStr[0];
      const thousands = numStr.substring(1);
      return `${millions}.${thousands}.000đ`;
    } else if (numStr.length >= 5) {
      const val = parseInt(numStr, 10);
      return formatVnd(val);
    }
  }

  return raw;
}

export function parseInstagramCaption(caption: string) {
  let name = "Sản phẩm Pao's 2hand";
  let condition = "9/10";
  let measurements = { n: 0, d: 0 };
  let description = "";
  let price = "Liên hệ";
  let isSold = false;
  let isAnnouncement = false;

  if (!caption) {
    const category: ProductCategory = 'tee';
    return { name, condition, measurements, description, price, isSold, isAnnouncement, category };
  }

  if (caption.toLowerCase().includes('sold')) {
    isSold = true;
  }

  const captionLower = caption.trim().toLowerCase();
  const firstLine = captionLower.split('\n')[0] || '';
  if (firstLine.includes('new drop')) {
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
    
    const priceMatch = line.match(/^(?:giá|gia|price)\s*:\s*(.+)$/i);
    if (priceMatch) {
      price = parsePriceString(priceMatch[1]);
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

  const category = detectCategory(name, caption);

  return { name, condition, measurements, description, price, isSold, isAnnouncement, category };
}
