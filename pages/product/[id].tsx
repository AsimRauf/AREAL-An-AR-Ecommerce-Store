import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { FiShoppingCart, FiBox, FiUser } from 'react-icons/fi'
import { CartContext } from '../../pages/_app'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  glbModel: string
  specifications: {
    dimensions: string
    weight: string
    material: string
  }
  seller: {
    _id: string
    name: string
    businessName: string
    profileImage: string
  }
}

export default function ProductViewer() {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showModelViewer, setShowModelViewer] = useState(false)
  const [currentScale, setCurrentScale] = useState(0.5)
  const { addToCart, setIsCartOpen } = useContext(CartContext)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      })
      setIsCartOpen(true)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/product/${id}`)
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  const adjustSize = (factor: number) => {
    const newScale = currentScale * factor
    setCurrentScale(newScale)
    const modelViewer = document.querySelector('model-viewer') as any
    if (modelViewer) {
      modelViewer.setAttribute('scale', `${newScale} ${newScale} ${newScale}`)
    }
  }

  const handleARView = () => {
    if (product && product.glbModel) {
      const timestamp = Date.now()
      window.open(`/product/ar-viewer?model=${encodeURIComponent(product.glbModel)}&t=${timestamp}`, '_blank')
    }
  }
  if (!product) return <div>Loading...</div>

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative h-[32rem] w-full">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 ${selectedImage === index ? 'ring-2 ring-indigo-600' : ''}`}
                  >
                    <Image
                      src={image}
                      alt={`Product ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-2xl text-indigo-600 font-bold">${product.price}</p>
              <p className="text-gray-600">{product.description}</p>

              {/* Seller Information */}
              <div className="flex rounded-xl overflow-hidden max-w-md">
                <div className="bg-gray-800 text-white px-4 py-3 flex items-center">
                  <span className="text-sm font-medium whitespace-nowrap">Sold By</span>
                </div>
                <div className="bg-gray-900 text-white px-4 py-3 flex-1 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {product.seller.profileImage ? (
                      <Image
                        src={product.seller.profileImage}
                        alt={product.seller.businessName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiUser size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium truncate">{product.seller.businessName}</h4>
                    <p className="text-xs text-gray-300 truncate">{product.seller.name}</p>
                  </div>
                </div>
              </div>



              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="font-medium text-gray-900">Dimensions</p>
                    <p className="text-gray-600">{product.specifications.dimensions}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="font-medium text-gray-900">Weight</p>
                    <p className="text-gray-600">{product.specifications.weight}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="font-medium text-gray-900">Material</p>
                    <p className="text-gray-600">{product.specifications.material}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                {product.glbModel && (
                  <button
                    onClick={handleARView}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                  >
                    <FiBox className="w-5 h-5" />
                    <span>View in AR</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
