import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) }
    case 'UPDATE_QTY': {
      if (action.qty <= 0)
        return { ...state, items: state.items.filter(i => i.id !== action.id) }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      }
    }
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, note: action.note } : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

const initialState = {
  items: JSON.parse(localStorage.getItem('kutin_cart') || '[]'),
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    localStorage.setItem('kutin_cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', item })
    toast.success(`Đã thêm "${item.name}" vào giỏ hàng! 🛒`)
  }

  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id })
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty })
  const updateNote = (id, note) => dispatch({ type: 'UPDATE_NOTE', id, note })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0)
  const totalAmount = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items: state.items, totalItems, totalAmount, addItem, removeItem, updateQty, updateNote, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
