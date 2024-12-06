import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import SellerLayout from '../../../components/layouts/SellerLayout'
import ProtectedSellerRoute from '../../../components/seller/ProtectedSellerRoute'
import { useSellerAuth } from '../../../utils/sellerAuth'
import { FiPackage, FiDollarSign, FiShoppingBag, FiTruck } from 'react-icons/fi'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}

export default function SellerDashboard() {
  const router = useRouter()
  const { getSession, logout } = useSellerAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      const session = getSession()
      if (!session) {
        router.push('/seller/auth/signin')
        return
      }

      try {
        const response = await fetch('/api/seller/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            logout()
            return
          }
          throw new Error('Failed to fetch stats')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])
  return (
    <ProtectedSellerRoute>
      <SellerLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                </div>
                <FiPackage className="text-indigo-500 text-3xl" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                </div>
                <FiShoppingBag className="text-green-500 text-3xl" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <FiDollarSign className="text-yellow-500 text-3xl" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Pending Orders</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                </div>
                <FiTruck className="text-red-500 text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {/* Recent orders will be populated here */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SellerLayout>
    </ProtectedSellerRoute>
  )
}
