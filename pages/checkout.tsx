import { useContext, useState } from 'react'
import { CartContext } from '../pages/_app'
import Image from 'next/image'
import { FiTrash2 } from 'react-icons/fi'

export default function Checkout() {
  const { items, updateQuantity, removeItem } = useContext(CartContext)
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 10
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Cart Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-xl flex gap-4">
                <div className="relative w-24 h-24">
                  <Image 
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-indigo-600 font-bold">${item.price}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <select 
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                      className="rounded-lg border-gray-200"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Shipping & Payment */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({
                      ...shippingAddress,
                      fullName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({
                        ...shippingAddress,
                        postalCode: e.target.value
                      })}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-6 hover:bg-indigo-700 transition-colors">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
