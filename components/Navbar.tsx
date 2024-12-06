import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useContext, useEffect } from 'react'
import { CartContext } from '../pages/_app'
import { useSidebar } from '@/context/SidebarContext'
import { FiMenu, FiSearch, FiX, FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi'



interface SearchResult {
    _id: string
    name: string
    images: string[]
    price: number
}

export default function Navbar() {
    const { data: session } = useSession()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const { cartCount, setIsCartOpen } = useContext(CartContext)
    const { toggleMobileSidebar, showDesktopSidebar } = useSidebar()

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.length > 2) {
                try {
                    const response = await fetch(`/api/search?q=${searchQuery}`)
                    const data = await response.json()
                    setSearchResults(data)
                    setShowResults(true)
                } catch (error) {
                    console.error('Search error:', error)
                }
            } else {
                setSearchResults([])
                setShowResults(false)
            }
        }

        const debounceTimer = setTimeout(fetchSearchResults, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    return (
        <nav className={`fixed top-0 right-0 bg-white shadow-sm z-50 transition-all duration-300 w-full ${showDesktopSidebar ? 'lg:pl-64' : 'pl-0'}`}>
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Menu & Logo */}
                    <div className="flex items-center gap-0">
                        {/* Single Menu Button - Mobile Only */}
                        <button
                            onClick={toggleMobileSidebar}
                            className="p-0 hover:bg-gray-100 rounded-xl lg:hidden"
                        >
                            <FiMenu size={24} />
                        </button>
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <div className="h-12 w-32 relative overflow-hidden">
                                <Image
                                    src="/ter.png"
                                    alt="AReal Logo"
                                    fill
                                    className="object-cover object-center"
                                    priority
                                />
                            </div>
                        </Link>


                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex max-w-[280px] ml-12 mr-auto">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full py-2.5 pl-4 pr-12 bg-indigo-50 rounded-xl text-gray-700 border-none focus:ring-2 focus:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowResults(true)}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                {searchQuery ? (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('')
                                            setShowResults(false)
                                        }}
                                        className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                                    >
                                        <FiX size={18} />
                                    </button>
                                ) : (
                                    <button className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors">
                                        <FiSearch size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-50">
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            href={`/product/${product._id}`}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                            onClick={() => {
                                                setShowResults(false)
                                                setSearchQuery('')
                                            }}
                                        >
                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                                                <p className="text-sm text-indigo-600">${product.price}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Right Side Icons */}
                    <div className="flex items-center gap-3">
                        <button className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex">
                            <FiHeart size={20} />
                        </button>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 relative"
                        >
                            <FiShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>


                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center"
                            >
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FiUser size={20} className="text-indigo-600" />
                                )}
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                    {session ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                                            >
                                                Edit Profile
                                            </Link>
                                            <button
                                                onClick={() => signOut()}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                            >
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/auth/signin"
                                            className="block px-4 py-2 text-indigo-600 hover:bg-indigo-50"
                                        >
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="mt-4 md:hidden relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full py-2.5 pl-4 pr-12 bg-indigo-50 rounded-xl text-gray-700 border-none focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowResults(true)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {searchQuery ? (
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setShowResults(false)
                                    }}
                                    className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                            ) : (
                                <button className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors">
                                    <FiSearch size={18} />
                                </button>
                            )}
                        </div>

                        {/* Mobile Search Results */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-50">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product._id}
                                        href={`/product/${product._id}`}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            setShowResults(false)
                                            setSearchQuery('')
                                        }}
                                    >
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-indigo-600">${product.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
        
    )
}
