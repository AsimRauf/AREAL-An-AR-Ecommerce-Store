import { useState, useEffect } from 'react'
import SellerLayout from '../../../components/layouts/SellerLayout'
import ProtectedSellerRoute from '../../../components/seller/ProtectedSellerRoute'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  inStock: boolean
  specifications: {
    dimensions: string
    weight: string
    material: string
  }
  glbModel?: string
}

const EditProductModal = ({ product, isOpen, onClose, onUpdate }: {
  product: Product
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    specifications: {
      dimensions: product.specifications?.dimensions || '',
      weight: product.specifications?.weight || '',
      material: product.specifications?.material || ''
    },
    currentImages: product.images,
    newImages: [] as File[],
    glbModel: null as File | null,
    removeGlbModel: false
  })

  const handleImageDelete = (index: number) => {
    const newImages = [...formData.currentImages]
    newImages.splice(index, 1)
    setFormData({ ...formData, currentImages: newImages })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formDataToSend = new FormData()

    formDataToSend.append('name', formData.name)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('price', formData.price.toString())
    formDataToSend.append('category', formData.category)

    formData.currentImages.forEach(img => {
      formDataToSend.append('currentImages', img)
    })

    Array.from(formData.newImages).forEach(file => {
      formDataToSend.append('images', file)
    })

    Object.entries(formData.specifications).forEach(([key, value]) => {
      formDataToSend.append(`specifications[${key}]`, value)
    })

    if (formData.glbModel) {
      formDataToSend.append('glbModel', formData.glbModel)
    }
    formDataToSend.append('removeGlbModel', formData.removeGlbModel.toString())

    try {
      const session = JSON.parse(localStorage.getItem('seller-session') || '{}')
      const response = await fetch(`/api/seller/products/${product._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        toast.success('Product updated successfully')
        onUpdate()
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to update product')
      }
    } catch (error) {
      toast.error('Error updating product')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 pb-4 mb-4 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white">Edit Product: {product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-700 rounded-full p-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 text-white rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 text-white rounded p-2 min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Furniture">Home & Furniture</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Sports & Fitness">Sports & Fitness</option>
                  <option value="Books & Stationery">Books & Stationery</option>
                  <option value="Toys & Games">Toys & Games</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Jewelry & Watches">Jewelry & Watches</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Garden & Outdoor">Garden & Outdoor</option>
                  <option value="Pet Supplies">Pet Supplies</option>
                  <option value="Art & Crafts">Art & Crafts</option>
                  <option value="Baby & Kids">Baby & Kids</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Musical Instruments">Musical Instruments</option>
                  <option value="Food & Beverages">Food & Beverages</option>
                  <option value="Tools & Hardware">Tools & Hardware</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Dimensions"
                  value={formData.specifications.dimensions}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, dimensions: e.target.value }
                  })}
                  className="w-full bg-gray-700 text-white rounded p-2"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Weight"
                  value={formData.specifications.weight}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, weight: e.target.value }
                  })}
                  className="w-full bg-gray-700 text-white rounded p-2"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Material"
                  value={formData.specifications.material}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, material: e.target.value }
                  })}
                  className="w-full bg-gray-700 text-white rounded p-2"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Product Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.currentImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    width={100}
                    height={100}
                    alt={`Product ${index + 1}`}
                    className="rounded w-full h-24 object-cover"
                    loading="lazy"
                    onError={async (e) => {
                      const target = e.target as HTMLImageElement
                      // Only refresh if URL contains 'Expires' and hasn't been refreshed
                      if (!target.dataset.refreshed && img.includes('Expires')) {
                        target.dataset.refreshed = 'true'
                        try {
                          const response = await fetch(`/api/seller/products/refresh-url?key=${encodeURIComponent(img)}`)
                          const data = await response.json()
                          if (data.url) {
                            target.src = data.url
                          }
                        } catch (err) {
                          console.error('Image refresh failed:', err)
                        }
                      }
                    }}
                    // Add key prop to force React to treat it as new image when src changes
                    key={img}
                  />



                  <button
                    type="button"
                    onClick={() => handleImageDelete(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6
                 flex items-center justify-center opacity-0 group-hover:opacity-100
                 transition-opacity duration-200 ease-in-out"
                  >
                    <span className="sr-only">Remove image</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-white mb-2">Add New Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, newImages: Array.from(e.target.files || []) })}
                className="w-full bg-gray-700 text-white rounded p-2 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:text-sm file:font-semibold
                     file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
            </div>
          </div>

          {/* 3D Model Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">3D Model</h3>
            {product.glbModel && !formData.removeGlbModel ? (
              <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                <span className="text-gray-300 truncate flex-1">
                  Current model: {product.glbModel.split('/').pop()}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, removeGlbModel: true })}
                  className="ml-2 text-red-400 hover:text-red-300 px-3 py-1 rounded border border-red-400 
                       hover:border-red-300"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".glb"
                  onChange={(e) => setFormData({ ...formData, glbModel: e.target.files?.[0] || null })}
                  className="w-full bg-gray-700 text-white rounded p-2 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0 file:text-sm file:font-semibold
                       file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
                {formData.glbModel && (
                  <p className="text-green-400 text-sm">
                    New model selected: {formData.glbModel.name}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-gray-800 pt-4 border-t border-gray-700 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('seller-session') || '{}')
      const response = await fetch('/api/seller/products', {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      })
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const session = JSON.parse(localStorage.getItem('seller-session') || '{}')
        const response = await fetch(`/api/seller/products/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        })
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId))
          toast.success('Product deleted successfully')
        }
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
  }

  return (
    <ProtectedSellerRoute>
      <SellerLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">My Products</h1>
            <button
              onClick={() => window.location.href = '/seller/dashboard/products/upload'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Add New Product
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 w-full">
              {products.map(product => (
                <div key={product._id} className="bg-gray-800 rounded-lg overflow-hidden flex w-full">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      onError={(e) => {
                        // Refresh the signed URL if load fails
                        const refreshUrl = async () => {
                          const response = await fetch(`/api/seller/products/refresh-url?key=${product.images[0]}`)
                          const { url } = await response.json()
                          if (e.target instanceof HTMLImageElement) {
                            e.target.src = url
                          }
                        }
                        refreshUrl()
                      }}
                      loading="eager"
                      priority={true}
                    />
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                      <p className="text-gray-400 text-lg">${product.price}</p>
                      <p className="text-gray-400">{product.category}</p>
                      <p className="text-gray-400">Stock: {product.inStock ? 'Available' : 'Out of Stock'}</p>
                    </div>

                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && selectedProduct && (
          <EditProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdate={fetchProducts}
          />
        )}
      </SellerLayout>
    </ProtectedSellerRoute>
  )
}




