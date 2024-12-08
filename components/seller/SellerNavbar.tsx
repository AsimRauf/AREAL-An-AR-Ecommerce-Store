import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { FiPackage, FiShoppingBag, FiBarChart2, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    <nav className="bg-gray-900 text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/seller/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              AREAL Seller Portal
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/seller/dashboard/products"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/5"
            >
              <FiPackage className="w-5 h-5" />
              <span>Products</span>
            </Link>

            <Link
              href="/seller/orders"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/5"
            >
              <FiShoppingBag className="w-5 h-5" />
              <span>Orders</span>
            </Link>

            <Link
              href="/seller/analytics"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/5"
            >
              <FiBarChart2 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>

            {/* Profile Dropdown */}
            {sellerSession && (
              <div className="relative profile-dropdown ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {sellerSession.seller.profileImage ? (
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 shadow-lg ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all" />
                      <Image
                        src={sellerSession.seller.profileImage}
                        alt={`${sellerSession.seller.name}'s profile`}
                        fill
                        sizes="40px"
                        className="rounded-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-400/50 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {sellerSession.seller.name[0]}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline font-medium">{sellerSession.seller.businessName}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-md shadow-xl z-50 border border-gray-700">
                    <Link
                      href="/seller/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800">
              {/* Add Profile Section in Mobile Menu */}
              {sellerSession && (
                <div className="px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    {sellerSession.seller.profileImage ? (
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 shadow-lg ring-2 ring-purple-500/20" />
                        <Image 
                          src={sellerSession.seller.profileImage}
                          alt={`${sellerSession.seller.name}'s profile`}
                          fill
                          sizes="40px"
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-indigo-400/50 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {sellerSession.seller.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">{sellerSession.seller.name}</div>
                      <div className="text-xs text-gray-400">{sellerSession.seller.businessName}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/seller/dashboard/products"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FiPackage className="w-5 h-5" />
                  <span>Products</span>
                </Link>
                <Link
                  href="/seller/orders"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/seller/analytics"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FiBarChart2 className="w-5 h-5" />
                  <span>Analytics</span>
                </Link>
              </div>

              {/* Add Profile Actions */}
              <div className="px-2 pt-2 pb-3 border-t border-gray-700">
                <Link
                  href="/seller/profile"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
           </div>
    </nav>
  )
}