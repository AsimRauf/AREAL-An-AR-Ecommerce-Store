import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import type { AppProps } from 'next/app'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { createContext, useState, useEffect } from 'react'
import Cart from '../components/Cart'
import Sidebar from '../components/Sidebar'
import { SidebarProvider } from '../context/SidebarContext'
import { useSidebar } from '../context/SidebarContext'

interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
}

export const CartContext = createContext<any>(null)

function Layout({ children, isSellerRoute, isSellerAuth, isUserAuth }: { 
  children: React.ReactNode
  isSellerRoute: boolean
  isSellerAuth: boolean
  isUserAuth: boolean 
}) {
  const { showDesktopSidebar } = useSidebar()

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${
      !isSellerRoute && !isSellerAuth && !isUserAuth && showDesktopSidebar ? 'lg:ml-64' : 'ml-0'
    }`}>
      <div className="flex-grow">
        {children}
      </div>
      {!isSellerRoute && !isSellerAuth && !isUserAuth && <Footer />}
    </div>
  )
}

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  const router = useRouter()
  const isSellerRoute = router.pathname.startsWith('/seller')
  const isSellerAuth = router.pathname.startsWith('/seller/auth')
  const isUserAuth = router.pathname.startsWith('/auth')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    if (isClient && cartItems.length >= 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isClient])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const cartContextValue = {
    items: cartItems,
    addToCart: (item: CartItem) => {
      setCartItems(prev => {
        const existing = prev.find(i => i._id === item._id)
        if (existing) {
          return prev.map(i =>
            i._id === item._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
        return [...prev, { ...item, quantity: 1 }]
      })
      setIsCartOpen(true)
    },
    updateQuantity: (id: string, qty: number) => {
      setCartItems(prev =>
        qty === 0
          ? prev.filter(i => i._id !== id)
          : prev.map(i => i._id === id ? { ...i, quantity: qty } : i)
      )
    },
    removeItem: (id: string) => setCartItems(prev => prev.filter(i => i._id !== id)),
    isCartOpen,
    setIsCartOpen,
    cartCount
  }

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <CartContext.Provider value={cartContextValue}>
          <Head>
            <script
              type="module"
              src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
            />
          </Head>
          <div className="min-h-screen bg-gray-50">
            {!isSellerRoute && !isSellerAuth && !isUserAuth && (
              <>
                <Navbar />
                <Sidebar isMobile={true} />
                <Sidebar isMobile={false} />
              </>
            )}
            <Layout 
              isSellerRoute={isSellerRoute}
              isSellerAuth={isSellerAuth}
              isUserAuth={isUserAuth}
            >
              <main className={!isSellerRoute && !isSellerAuth && !isUserAuth ? "pt-16" : ""}>
                <Component {...pageProps} />
              </main>
            </Layout>
            {isClient && (
              <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                updateQuantity={cartContextValue.updateQuantity}
                removeItem={cartContextValue.removeItem}
              />
            )}
            <Toaster />
          </div>
        </CartContext.Provider>
      </SidebarProvider>
    </SessionProvider>
  )
}
