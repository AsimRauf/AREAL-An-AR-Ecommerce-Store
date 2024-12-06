import Image from 'next/image'
import Link from 'next/link'
import { useContext } from 'react'
import { CartContext } from '../pages/_app'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'

interface Product {
  _id: string
  name: string
  price: number
  images: string[]
  badges?: string[]
  seller: {
    businessName: string
    profileImage: string
  }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setIsCartOpen } = useContext(CartContext)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    }
    addToCart(cartItem)
    setIsCartOpen(true)
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <Link href={`/product/${product._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="relative">
          <div className="relative w-full overflow-hidden bg-gray-50 h-[200px] sm:h-[280px] flex items-center justify-center border-b border-gray-200/60">
            <div className="relative w-[100%] h-[100%] rounded-lg ring-1 ring-gray-200/30">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover [aspect-ratio:4/3] wide:object-contain hover:scale-105 transition-transform duration-300"
                style={{ objectFit: 'contain', transform: 'scale(1.21)' }}
                priority
              />
            </div>

            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-row-reverse items-start gap-2">
              <button
                onClick={handleAddToWishlist}
                className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
              >
                <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-red-500" />
              </button>

              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {product.badges.map((badge) => (
                    <span
                      key={badge}
                      className="bg-indigo-500/30 backdrop-blur-md border border-indigo-300/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm tracking-wide uppercase flex items-center transition-all duration-200 hover:bg-indigo-500/40"
                    >
                      {badge.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-1.5 sm:mb-2">
            {product.seller?.profileImage && (
              <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-gray-100">
                <Image
                  src={product.seller.profileImage}
                  alt={product.seller.businessName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
              {product.seller?.businessName}
            </p>
          </div>

          <h3 className="font-bold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-indigo-600 font-bold text-base sm:text-lg">
              ${product.price}
            </p>
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 sm:gap-2"
            >
              <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
