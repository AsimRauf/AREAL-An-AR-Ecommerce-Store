import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

interface SellerSession {
  seller: {
    id: string
    name: string
    email: string
    businessName: string
    profileImage: string
  }
  token: string
}

export default function SellerNavbar() {
  const [sellerSession, setSellerSession] = useState<SellerSession | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('seller-session')
    if (session) {
      setSellerSession(JSON.parse(session))
    } else {
      router.push('/seller/auth/signin')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('seller-session')
    router.push('/seller/auth/signin')
  }

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/seller/dashboard" className="text-xl font-bold">
              Seller Portal
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/seller/dashboard/products" className="hover:text-indigo-400">
              Products
            </Link>
            <Link href="/seller/orders" className="hover:text-indigo-400">
              Orders
            </Link>
            <Link href="/seller/analytics" className="hover:text-indigo-400">
              Analytics
            </Link>

            {sellerSession && (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  {sellerSession.seller.profileImage ? (
                    <Image 
                      src={sellerSession.seller.profileImage}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      {sellerSession.seller.name[0]}
                    </div>
                  )}
                  <span>{sellerSession.seller.businessName}</span>
                </button>

                <div className="absolute right-0 w-48 mt-2 py-2 bg-gray-800 rounded-md shadow-xl hidden group-hover:block">
                  <Link href="/seller/profile" className="block px-4 py-2 hover:bg-gray-700">
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
