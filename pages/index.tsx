import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductGrid from '../components/ProductGrid'

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
  
  const categories = [
    'all',
    'Electronics',
    'Fashion',
    'Home & Furniture',
    'Beauty & Personal Care',
    'Sports & Fitness',
    'Books & Stationery',
    'Toys & Games',
    'Automotive',
    'Health & Wellness',
    'Jewelry & Watches',
    'Home Appliances',
    'Garden & Outdoor',
    'Pet Supplies',
    'Art & Crafts',
    'Baby & Kids',
    'Office Supplies',
    'Musical Instruments',
    'Food & Beverages',
    'Tools & Hardware'
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
        <section className="relative h-[70vh] lg:h-[90vh] bg-indigo-900 w-full mt-[60px] lg:mt-[0px]">
          <Image
            src="/hero-section.jpg"
            alt="AR Furniture Shopping"
            fill
            className="object-cover object-[center_65%] opacity-50 sm:object-[center_60%] lg:object-[center_5%]"
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

        {/* Category Filters */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-4 pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
          <ProductGrid />
        </div>
      </main>
    </div>
  )
}
