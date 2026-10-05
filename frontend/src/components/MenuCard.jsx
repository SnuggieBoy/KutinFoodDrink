import { Plus, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/menuData'

const badgeColors = {
  'Hot': 'bg-red-500 text-white',
  'Món Hot': 'bg-red-500 text-white',
  'Mới': 'bg-blue-500 text-white',
  'Bán chạy': 'bg-orange-500 text-white',
  'Đặc biệt': 'bg-purple-600 text-white',
  'VIP': 'bg-yellow-500 text-white',
  'Thượng hạng': 'bg-yellow-500 text-white',
}

// Unsplash food images by category
const categoryImages = {
  'pha-lau': 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',
  'com-tron': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
  'com-chien': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
  'mi-cay': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
  'mi-xao': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
  'mi-mien-tron': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80',
  'nui': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
  'tokpokki': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80',
  'ga-xu': 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80',
  'bach-tuoc': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
  'lau': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
  'an-vat': 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=400&q=80',
  'canh-kim-chi': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
  'nuoc': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
}

export default function MenuCard({ item, compact = false }) {
  const { addItem } = useCart()
  const imgSrc = categoryImages[item.category] || categoryImages.default

  const displayBadge = item.badge === 'Hot' ? '🔥 Món Hot' : item.badge === 'VIP' ? '👑 Thượng Hạng' : item.badge

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md card-hover border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={imgSrc}
          alt={item.name}
          className={`w-full object-cover transition-transform duration-500 hover:scale-110 ${compact ? 'h-40' : 'h-48'}`}
          loading="lazy"
        />
        {item.badge && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors[item.badge] || 'bg-gray-600 text-white'}`}>
            {displayBadge}
          </span>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">Tạm hết</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">{item.name}</h3>
        {!compact && item.description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          <div>
            <p className="text-[#1a5c2a] font-black text-base">{formatPrice(item.price)}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill="#f5c518" stroke="none" />
              ))}
            </div>
          </div>
          <button
            disabled={!item.isAvailable}
            onClick={() => addItem(item)}
            className="flex items-center gap-1 bg-[#1a5c2a] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#2d7a40] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95"
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>
      </div>
    </div>
  )
}
