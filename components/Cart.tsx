import { useState, useEffect } from 'react'
import { FiX, FiMinus, FiPlus } from 'react-icons/fi'
import Image from 'next/image'
import Link from 'next/link'

interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
}

export default function Cart({ isOpen, onClose, items, updateQuantity, removeItem }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Shopping Cart ({items.length})</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="flex gap-4 bg-white rounded-lg p-2 shadow-sm">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-indigo-600 font-bold">${item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
            <div className="p-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold">${total}</span>
              </div>
              <Link 
                href="/checkout"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                onClick={() => onClose()}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
      </div>
    </>
  )
}
