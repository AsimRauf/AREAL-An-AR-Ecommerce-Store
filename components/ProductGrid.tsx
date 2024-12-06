import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
  {products.map((product) => (
    <ProductCard key={product._id} product={product} />
  ))}
</div>
  )
}
