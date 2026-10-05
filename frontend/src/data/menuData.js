// Menu data extracted from KUTIN Food & Drink menu board
export const categories = [
  { id: 'pha-lau', name: 'Phá Lẩu Khô Miền Tây', icon: '🍲', color: '#e74c3c' },
  { id: 'com-tron', name: 'Cơm Trộn', icon: '🍚', color: '#e67e22' },
  { id: 'com-chien', name: 'Cơm Chiên', icon: '🍳', color: '#f39c12' },
  { id: 'mi-cay', name: 'Mì Cay', icon: '🌶️', color: '#c0392b' },
  { id: 'mi-xao', name: 'Mì Xào', icon: '🍜', color: '#8e44ad' },
  { id: 'mi-mien-tron', name: 'Mì - Miến Trộn', icon: '🥢', color: '#2980b9' },
  { id: 'nui', name: 'Nui', icon: '🍝', color: '#16a085' },
  { id: 'tokpokki', name: 'Tokpokki', icon: '🇰🇷', color: '#e74c3c' },
  { id: 'ga-xu', name: 'Gà Xù', icon: '🍗', color: '#e67e22' },
  { id: 'bach-tuoc', name: 'Bạch Tuộc', icon: '🐙', color: '#8e44ad' },
  { id: 'lau', name: 'Lẩu', icon: '🫕', color: '#c0392b' },
  { id: 'an-vat', name: 'Ăn Vặt', icon: '🍟', color: '#f39c12' },
  { id: 'canh-kim-chi', name: 'Canh Kim Chi', icon: '🥘', color: '#27ae60' },
  { id: 'nuoc', name: 'Nước Ngọt - Beer', icon: '🧃', color: '#3498db' },
]

export const menuItems = [
  // PHÁ LẨU KHÔ MIỀN TÂY
  { id: 1, category: 'pha-lau', name: 'Phá Lẩu Khô (kèm rau dưa, bánh mì)', price: 35000, badge: 'Hot', description: 'Phá lẩu khô đặc trưng miền Tây, kèm rau dưa và bánh mì', isAvailable: true, isFeatured: true },
  { id: 2, category: 'pha-lau', name: 'Mì Xào Phá Lẩu', price: 35000, description: 'Mì xào với phá lẩu đậm đà', isAvailable: true },
  { id: 3, category: 'pha-lau', name: 'Cơm Phá Lẩu', price: 35000, description: 'Cơm ăn cùng phá lẩu khô', isAvailable: true },

  // CƠM TRỘN
  { id: 4, category: 'com-tron', name: 'Cơm Trộn Gà Xù', price: 40000, badge: 'Bán chạy', description: 'Cơm trộn với gà xù giòn rụm đặc biệt', isAvailable: true, isFeatured: true },
  { id: 5, category: 'com-tron', name: 'Cơm Trộn Hải Sản', price: 40000, description: 'Cơm trộn với hải sản tươi ngon', isAvailable: true },
  { id: 6, category: 'com-tron', name: 'Cơm Trộn Heo Xù', price: 40000, description: 'Cơm trộn với thịt heo xù', isAvailable: true },
  { id: 7, category: 'com-tron', name: 'Cơm Gà Sốt Cay', price: 40000, badge: 'Hot', description: 'Cơm với gà sốt cay đặc biệt', isAvailable: true, isFeatured: true },
  { id: 8, category: 'com-tron', name: 'Cơm Gà Xào Kim Chi', price: 40000, description: 'Cơm gà xào kim chi Hàn Quốc', isAvailable: true },
  { id: 9, category: 'com-tron', name: 'Cơm Kim Chi', price: 40000, description: 'Cơm trộn kim chi', isAvailable: true },
  { id: 10, category: 'com-tron', name: 'Cơm Trộn Gà Xù Phô Mai', price: 55000, badge: 'Mới', description: 'Cơm trộn gà xù với phô mai tan chảy', isAvailable: true, isFeatured: true },
  { id: 11, category: 'com-tron', name: 'Cơm Trộn Bò Phô Mai', price: 55000, description: 'Cơm trộn bò với phô mai', isAvailable: true },
  { id: 12, category: 'com-tron', name: 'Cơm Gà Sốt Cay Phô Mai', price: 55000, description: 'Gà sốt cay kết hợp phô mai béo ngậy', isAvailable: true },
  { id: 13, category: 'com-tron', name: 'Cơm Gà Hàn Quốc Sốt Cay', price: 55000, description: 'Gà kiểu Hàn Quốc sốt cay', isAvailable: true },
  { id: 14, category: 'com-tron', name: 'Cơm Gà Trộn Kim Chi Phô Mai', price: 55000, description: 'Gà trộn kim chi và phô mai', isAvailable: true },
  { id: 15, category: 'com-tron', name: 'Cơm Bò Xào Kim Chi Phô Mai', price: 55000, description: 'Bò xào kim chi với phô mai', isAvailable: true },

  // CƠM CHIÊN
  { id: 16, category: 'com-chien', name: 'Cơm Phủ Trứng Tôm Thanh Cua', price: 55000, badge: 'Hot', description: 'Cơm chiên phủ trứng với tôm và thanh cua', isAvailable: true, isFeatured: true },
  { id: 17, category: 'com-chien', name: 'Cơm Bò Phủ Trứng', price: 50000, description: 'Cơm bò chiên phủ trứng', isAvailable: true },
  { id: 18, category: 'com-chien', name: 'Cơm Phủ Trứng Tôm', price: 60000, description: 'Cơm chiên phủ trứng tôm', isAvailable: true },
  { id: 19, category: 'com-chien', name: 'Cơm Heo Xù Phủ Trứng', price: 45000, description: 'Cơm heo xù với trứng chiên', isAvailable: true },
  { id: 20, category: 'com-chien', name: 'Cơm Chiên Tốp Mỡ', price: 45000, description: 'Cơm chiên với tốp mỡ giòn', isAvailable: true },

  // MÌ CAY
  { id: 21, category: 'mi-cay', name: 'Mì Cay Thập Cẩm Đặc Biệt (full topping)', price: 70000, badge: 'Đặc biệt', description: 'Mì cay thập cẩm full topping - dành cho người thích cay', isAvailable: true, isFeatured: true },
  { id: 22, category: 'mi-cay', name: 'Mì Cay Hải Sản', price: 50000, description: 'Mì cay với hải sản tươi ngon', isAvailable: true },
  { id: 23, category: 'mi-cay', name: 'Mì Cay Bò', price: 55000, description: 'Mì cay với thịt bò', isAvailable: true },
  { id: 24, category: 'mi-cay', name: 'Mì Cay Bò - Xúc Xích', price: 55000, description: 'Mì cay bò với xúc xích', isAvailable: true },
  { id: 25, category: 'mi-cay', name: 'Mì Cay Bò - Đậu Hũ Phô Mai', price: 55000, description: 'Mì cay bò với đậu hũ phô mai', isAvailable: true },
  { id: 26, category: 'mi-cay', name: 'Mì Cay Bò - Thanh Cua', price: 55000, description: 'Mì cay bò với thanh cua', isAvailable: true },
  { id: 27, category: 'mi-cay', name: 'Mì Cay Đậu Hũ Phô Mai', price: 55000, description: 'Mì cay với đậu hũ phô mai', isAvailable: true },
  { id: 28, category: 'mi-cay', name: 'Mì Cay Đậu Hũ Phô Mai - Thanh Cua', price: 55000, description: 'Mì cay đậu hũ phô mai và thanh cua', isAvailable: true },
  { id: 29, category: 'mi-cay', name: 'Mì Cay Đậu Hũ Phô Mai - Xúc Xích', price: 45000, description: 'Mì cay đậu hũ phô mai và xúc xích', isAvailable: true },
  { id: 30, category: 'mi-cay', name: 'Mì Cay Chả Cá Hàn Quốc', price: 55000, description: 'Mì cay với chả cá Hàn Quốc', isAvailable: true },
  { id: 31, category: 'mi-cay', name: 'Mì Cay Mandu', price: 55000, description: 'Mì cay với mandu (bánh bao Hàn)', isAvailable: true },
  { id: 32, category: 'mi-cay', name: 'Mì Cay Xúc Xích', price: 90000, description: 'Mì cay với xúc xích', isAvailable: true },

  // MÌ XÀO
  { id: 33, category: 'mi-xao', name: 'Mì Xào Thập Cẩm', price: 60000, badge: 'Bán chạy', description: 'Mì xào thập cẩm với đầy đủ nguyên liệu', isAvailable: true, isFeatured: true },
  { id: 34, category: 'mi-xao', name: 'Mì Xào Hải Sản', price: 60000, description: 'Mì xào hải sản tươi ngon', isAvailable: true },
  { id: 35, category: 'mi-xao', name: 'Mì Xào Bò', price: 45000, description: 'Mì xào với thịt bò', isAvailable: true },
  { id: 36, category: 'mi-xao', name: 'Mì Udon Xào Hải Sản', price: 65000, description: 'Mì udon xào hải sản Nhật Bản', isAvailable: true },
  { id: 37, category: 'mi-xao', name: 'Mì Xào Bò Phô Mai', price: 60000, description: 'Mì xào bò với phô mai', isAvailable: true },
  { id: 38, category: 'mi-xao', name: 'Mì Hongkong', price: 65000, description: 'Mì kiểu Hồng Kông đặc biệt', isAvailable: true },

  // MÌ - MIẾN TRỘN
  { id: 39, category: 'mi-mien-tron', name: 'Mì Trộn Kim Chi Thập Cẩm', price: 60000, badge: 'Hot', description: 'Mì trộn kim chi thập cẩm đậm vị Hàn', isAvailable: true, isFeatured: true },
  { id: 40, category: 'mi-mien-tron', name: 'Mì Trộn Kim Chi Gà Hải Sản', price: 50000, description: 'Mì trộn kim chi gà và hải sản', isAvailable: true },
  { id: 41, category: 'mi-mien-tron', name: 'Mì Trộn Kim Chi', price: 60000, description: 'Mì trộn với kim chi chua cay', isAvailable: true },
  { id: 42, category: 'mi-mien-tron', name: 'Gà Bơ Tỏi', price: 60000, description: 'Gà xào bơ tỏi thơm lừng', isAvailable: true },
  { id: 43, category: 'mi-mien-tron', name: 'Lác Phô Mai', price: 55000, description: 'Miến trộn lác phô mai', isAvailable: true },
  { id: 44, category: 'mi-mien-tron', name: 'Miến Trộn Bò', price: 55000, description: 'Miến trộn với thịt bò', isAvailable: true },

  // NUI
  { id: 45, category: 'nui', name: 'Nui Xào Thập Cẩm', price: 60000, description: 'Nui xào thập cẩm đầy đủ topping', isAvailable: true, isFeatured: true },
  { id: 46, category: 'nui', name: 'Nui Xào Hải Sản', price: 50000, description: 'Nui xào hải sản tươi ngon', isAvailable: true },
  { id: 47, category: 'nui', name: 'Nui Xào Bò', price: 45000, description: 'Nui xào thịt bò', isAvailable: true },

  // TOKPOKKI
  { id: 48, category: 'tokpokki', name: 'Tokpokki Thập Cẩm', price: 55000, badge: 'Hot', description: 'Tokpokki thập cẩm kiểu Hàn Quốc', isAvailable: true, isFeatured: true },
  { id: 49, category: 'tokpokki', name: 'Tokpokki Hải Sản', price: 45000, description: 'Tokpokki với hải sản tươi', isAvailable: true },
  { id: 50, category: 'tokpokki', name: 'Tokpokki Phô Mai Thập Cẩm', price: 65000, badge: 'Mới', description: 'Tokpokki thập cẩm phủ phô mai tan chảy', isAvailable: true, isFeatured: true },
  { id: 51, category: 'tokpokki', name: 'Gà Chà Bông Tokpokki', price: 45000, description: 'Tokpokki với gà chà bông', isAvailable: true },
  { id: 52, category: 'tokpokki', name: 'Tokpokki Phô Mai Bò', price: 45000, description: 'Tokpokki phô mai với bò', isAvailable: true },

  // GÀ XÙ
  { id: 53, category: 'ga-xu', name: 'Gà Xù Sốt Cay Phô Mai', price: 55000, badge: 'Bán chạy', description: 'Gà xù giòn rụm sốt cay với phô mai', isAvailable: true, isFeatured: true },
  { id: 54, category: 'ga-xu', name: 'Gà Xù Sốt Kem Phô Mai', price: 55000, description: 'Gà xù với sốt kem phô mai béo ngậy', isAvailable: true },
  { id: 55, category: 'ga-xu', name: 'Gà Xù Mai Cay', price: 55000, description: 'Gà xù sốt mai cay', isAvailable: true },
  { id: 56, category: 'ga-xu', name: 'Gà Bơ Tỏi', price: 55000, description: 'Gà xào bơ tỏi thơm ngon', isAvailable: true },
  { id: 57, category: 'ga-xu', name: 'Gà Xù Tokpokki Sốt Cay Phô Mai', price: 65000, badge: 'Hot', description: 'Gà xù kết hợp tokpokki sốt cay phô mai', isAvailable: true, isFeatured: true },
  { id: 58, category: 'ga-xu', name: 'Gà Xù Tokpokki Sốt Kem Phô Mai', price: 65000, description: 'Gà xù tokpokki sốt kem phô mai', isAvailable: true },
  { id: 59, category: 'ga-xu', name: 'Gà Xù Tokpokki Phô Mai Cay', price: 65000, description: 'Gà xù tokpokki phô mai cay đặc biệt', isAvailable: true },
  { id: 60, category: 'ga-xu', name: 'Gà Xù Tokpokki Lác Phô Mai', price: 65000, description: 'Gà xù tokpokki lác phô mai', isAvailable: true },

  // BẠCH TUỘC
  { id: 61, category: 'bach-tuoc', name: 'Bạch Tuộc Sốt Cay Phô Mai (bánh mì)', price: 59000, badge: 'Hot', description: 'Bạch tuộc sốt cay phô mai ăn kèm bánh mì', isAvailable: true, isFeatured: true },
  { id: 62, category: 'bach-tuoc', name: 'Bạch Tuộc Xào Cay (cơm trắng)', price: 59000, description: 'Bạch tuộc xào cay ăn kèm cơm trắng', isAvailable: true },
  { id: 63, category: 'bach-tuoc', name: 'Bạch Tuộc Xào Cay (bánh mì)', price: 59000, description: 'Bạch tuộc xào cay ăn kèm bánh mì', isAvailable: true },

  // LẨU
  { id: 64, category: 'lau', name: 'Lẩu Nhỏ', price: 150000, description: 'Lẩu cỡ nhỏ dành cho 1-2 người', isAvailable: true },
  { id: 65, category: 'lau', name: 'Lẩu Vừa', price: 200000, description: 'Lẩu cỡ vừa dành cho 2-3 người', isAvailable: true },
  { id: 66, category: 'lau', name: 'Lẩu Lớn', price: 250000, description: 'Lẩu cỡ lớn dành cho 3-4 người', isAvailable: true },
  { id: 67, category: 'lau', name: 'Đặc Biệt', price: 300000, badge: 'VIP', description: 'Lẩu đặc biệt cao cấp full topping', isAvailable: true },

  // ĂN VẶT
  { id: 68, category: 'an-vat', name: 'Súc Cào Chiên', price: 35000, description: 'Súc cào chiên giòn', isAvailable: true },
  { id: 69, category: 'an-vat', name: 'Sủi Cảo Sốt Gà Sate', price: 35000, description: 'Sủi cảo với sốt gà sate', isAvailable: true },
  { id: 70, category: 'an-vat', name: 'Sủi Cảo Sốt Giảm Đen', price: 35000, description: 'Sủi cảo sốt giảm đen', isAvailable: true },
  { id: 71, category: 'an-vat', name: 'Cá Viên Sốt Mặn Tỏi', price: 75000, description: 'Cá viên sốt mặn tỏi đặc biệt', isAvailable: true },
  { id: 72, category: 'an-vat', name: 'Khoai Tây Đút Lò Phô Mai', price: 35000, description: 'Khoai tây đút lò với phô mai tan chảy', isAvailable: true, badge: 'Hot' },
  { id: 73, category: 'an-vat', name: 'Mandu Chiên', price: 25000, description: 'Bánh bao Hàn chiên giòn', isAvailable: true },
  { id: 74, category: 'an-vat', name: 'Cơm Hải Sản', price: 15000, description: 'Cơm hải sản', isAvailable: true },
  { id: 75, category: 'an-vat', name: 'Xúc Xích', price: 15000, description: 'Xúc xích chiên', isAvailable: true },
  { id: 76, category: 'an-vat', name: 'Tôm Cuộn Khoai Tây', price: 35000, description: 'Tôm cuộn khoai tây chiên', isAvailable: true },
  { id: 77, category: 'an-vat', name: 'Bắp Xào Tốp Mỡ Phô Mai', price: 25000, description: 'Bắp xào với tốp mỡ và phô mai', isAvailable: true },
  { id: 78, category: 'an-vat', name: 'Tokpokki Lắc Phô Mai', price: 25000, description: 'Tokpokki lắc phô mai nhỏ', isAvailable: true },

  // CANH KIM CHI
  { id: 79, category: 'canh-kim-chi', name: 'Canh Kim Chi Hải Sản', price: 50000, badge: 'Hot', description: 'Canh kim chi hải sản tươi ngon', isAvailable: true, isFeatured: true },
  { id: 80, category: 'canh-kim-chi', name: 'Canh Kim Chi Bò', price: 50000, description: 'Canh kim chi với thịt bò', isAvailable: true },
  { id: 81, category: 'canh-kim-chi', name: 'Canh Kim Chi Chả Cá Hàn Quốc', price: 50000, description: 'Canh kim chi chả cá kiểu Hàn', isAvailable: true },
  { id: 82, category: 'canh-kim-chi', name: 'Canh Kim Chi Mandu', price: 50000, description: 'Canh kim chi với mandu', isAvailable: true },
  { id: 83, category: 'canh-kim-chi', name: 'Thêm Miến', price: 10000, description: 'Thêm miến vào canh', isAvailable: true },

  // NƯỚC NGỌT - BEER
  { id: 84, category: 'nuoc', name: 'Rau Má Đậu Xanh', price: 20000, description: 'Rau má đậu xanh giải nhiệt', isAvailable: true },
  { id: 85, category: 'nuoc', name: 'Trà Tắc Trạch Trà', price: 15000, description: 'Trà tắc trạch trà thơm ngon', isAvailable: true },
  { id: 86, category: 'nuoc', name: 'Pepsi / Coca / Sting / 7up', price: 15000, description: 'Nước ngọt có ga các loại', isAvailable: true },
  { id: 87, category: 'nuoc', name: 'Trà Sữa Truyện Thống', price: 25000, description: 'Trà sữa truyền thống', isAvailable: true },
  { id: 88, category: 'nuoc', name: 'Chanh Tuyết Đá Xay', price: 25000, description: 'Chanh tuyết xay lạnh mát', isAvailable: true },
  { id: 89, category: 'nuoc', name: 'Chanh Tuyết Ngọc Bích', price: 25000, description: 'Chanh tuyết ngọc bích đặc biệt', isAvailable: true },
  { id: 90, category: 'nuoc', name: 'Strongbow', price: 20000, description: 'Strongbow táo lạnh', isAvailable: true },
  { id: 91, category: 'nuoc', name: 'Soju', price: 20000, description: 'Soju Hàn Quốc', isAvailable: true },
]

export const featuredItems = menuItems.filter(item => item.isFeatured)

export const getItemsByCategory = (categoryId) =>
  menuItems.filter(item => item.category === categoryId)

export const getActiveMenu = () => {
  try {
    const saved = localStorage.getItem('kutin_custom_menu')
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return menuItems
}

export const saveActiveMenu = (items) => {
  try {
    localStorage.setItem('kutin_custom_menu', JSON.stringify(items))
  } catch (e) {}
}

export const categoryImages = {
  'pha-lau': 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80',
  'com-tron': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
  'com-chien': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
  'mi-cay': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80',
  'mi-xao': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
  'mi-mien-tron': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80',
  'nui': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&q=80',
  'tokpokki': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&q=80',
  'ga-xu': 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80',
  'bach-tuoc': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',
  'lau': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80',
  'an-vat': 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=500&q=80',
  'canh-kim-chi': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
  'nuoc': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
}

export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

