# KUTIN Food & Drink — Website Documentation

## 🚀 Cài đặt và Chạy

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
# → Mở http://localhost:5173

# Build production
npm run build
```

## 📁 Cấu Trúc Dự Án

```
KutinFoodDrink/
├── frontend/                    # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Landing page (8 sections)
│   │   │   ├── MenuPage.jsx     # Menu đầy đủ + filter
│   │   │   ├── OrderPage.jsx    # Đặt món + checkout
│   │   │   ├── TrackOrderPage.jsx  # Theo dõi đơn hàng
│   │   │   └── AdminPage.jsx    # Dashboard quản lý
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Nav responsive + cart badge
│   │   │   ├── Footer.jsx       # Footer + Google Maps
│   │   │   ├── MenuCard.jsx     # Card món ăn
│   │   │   ├── CartDrawer.jsx   # Giỏ hàng sidebar
│   │   │   └── ScrollToTop.jsx  # Utility
│   │   ├── context/
│   │   │   └── CartContext.jsx  # Global cart state
│   │   └── data/
│   │       └── menuData.js      # Toàn bộ thực đơn (91 món)
│   ├── .env.example
│   └── vite.config.js
├── backend/                     # (Phase 2 - Node.js + Supabase)
├── db/                          # (Phase 2 - SQL migrations)
└── docs/                        # Tài liệu
```

## 🌐 Các Trang

| URL | Trang |
|-----|-------|
| `/` | Landing Page (Trang chủ) |
| `/menu` | Menu đầy đủ + tìm kiếm |
| `/order` | Đặt món online |
| `/track` | Theo dõi đơn hàng |
| `/admin` | Quản lý (pass: kutin2024) |

## 🎨 Màu Sắc Thương Hiệu

- **Xanh lá chính:** `#1a5c2a`
- **Vàng gold:** `#f5c518`
- **Kem:** `#fdf8f0`

## 📞 Thông Tin Quán

- **Tên:** KUTIN Food & Drink
- **Địa chỉ:** 1 Ngô Sĩ Liên, KP2, Hố Nai, Đồng Nai
- **Hotline:** 0947 007 881
- **Giờ mở cửa:** 10:00 - 20:30 hàng ngày
