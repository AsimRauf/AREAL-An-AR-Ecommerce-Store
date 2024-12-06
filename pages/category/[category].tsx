import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { FiFilter, FiChevronDown } from 'react-icons/fi'

export default function CategoryProducts() {
  const router = useRouter()
  const { category } = router.query
  const [products, setProducts] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const productsPerPage = 12

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ]

  useEffect(() => {
    if (category) {
      fetchProducts()
    }
  }, [category, sortBy, currentPage])

  const fetchProducts = async () => {
    const res = await fetch(`/api/product/category/${category}?sort=${sortBy}&page=${currentPage}`)
    const data = await res.json()
    setProducts(data.products)
  }

  return (
    <div className="container mx-auto px-4 pt-20 sm:pt-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold capitalize mb-6">          {category}
        </h1>

        <div className="flex gap-4 items-center">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 cursor-pointer"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            <FiFilter />
            Filter
          </button>
        </div>
      </div>

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          {/* Add filter options here */}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-lg ${currentPage === i + 1
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
