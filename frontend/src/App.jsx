import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import TrackOrderPage from './pages/TrackOrderPage'
import AdminPage from './pages/AdminPage'
import PosPage from './pages/PosPage'
import { RestaurantProvider } from './context/RestaurantContext'
import MobileBottomNav from './components/MobileBottomNav'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <RestaurantProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/pos" element={<PosPage />} />
        </Routes>
        <MobileBottomNav />
      </CartProvider>
    </RestaurantProvider>
  )
}

export default App
