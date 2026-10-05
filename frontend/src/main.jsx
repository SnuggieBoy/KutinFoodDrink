import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a5c2a',
            color: '#fff',
            fontFamily: "'Be Vietnam Pro', sans-serif",
          },
          success: {
            iconTheme: { primary: '#f5c518', secondary: '#1a5c2a' },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
