import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductGrid from '../components/ProductGrid'
import { 
  HiFire,  // Fire icon
  HiStar,  // Star icon
  HiTrendingUp,  // Trending icon
  HiSparkles,   // For best seller
  HiClock    // Clock icon
} from 'react-icons/hi'


interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  specifications: {
    dimensions: string
    weight: string
    material: string
  }
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  

  const badges = [
    { id: 'hot_selling', label: 'Hot Selling', icon: HiFire },
    { id: 'new_arrival', label: 'New Arrival', icon: HiStar },
    { id: 'trending', label: 'Trending', icon: HiTrendingUp },
    { id: 'best_seller', label: 'Best Seller', icon: HiSparkles },
    { id: 'limited_edition', label: 'Limited Edition', icon: HiClock }
  ]  
  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <section className="relative h-[74vh] lg:h-[90vh] bg-indigo-900 w-full mt-[76px] lg:mt-[0px]">
          <Image
            src="/hero-section.jpg"
            alt="AR Furniture Shopping"
            fill
            className="object-cover object-[center_35%] opacity-50 sm:object-[center_60%] lg:object-[center_5%]"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center translate-y-4 sm:translate-y-0">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Pakistan's First AR Shopping Platform</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">Experience products in augmented reality before you buy. Explore our multivendor marketplace featuring furniture, decor, electronics, and more.</p>
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors">
                Start AR Shopping
              </button>
            </div>
          </div>
        </section>
          {/* Badges Filter */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="relative">
              <div className="flex justify-center">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 max-w-full">
                  {badges.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedCategory(id)}
                      className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-full 
                        transition-all duration-300 shadow-sm flex-shrink-0
                        ${selectedCategory === id 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200/50' 
                          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-indigo-50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${
                        selectedCategory === id ? 'text-white' : 'text-indigo-500'
                      }`} />
                      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 pt-0 pb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
          <ProductGrid />
        </div>
      </main>
    </div>
  )
}
