import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  seller: {
    businessName: string
    profileImage: string
  }
}

export default function ProductGrid({ category = '' }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products${category ? `?category=${category}` : ''}`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        // Add a minimum delay to prevent flash
        setTimeout(() => setLoading(false), 1000)
      }
    }

    fetchProducts()
  }, [category])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {loading ? (
        // Skeleton loading grid
        [...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))
      ) : (
        // Actual products grid
        products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  )
}