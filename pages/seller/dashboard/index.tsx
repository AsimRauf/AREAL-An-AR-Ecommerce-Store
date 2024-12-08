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
  recentOrders: Array<{
    id: string
    customerName: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    date: string
  }>
}

export default function SellerDashboard() {
  const router = useRouter()
  const { getSession, logout } = useSellerAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      
      const session = getSession()
      if (!session) {
        router.push('/seller/auth/signin')
        return
      }

      try {
        const response = await fetch('/api/seller/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            logout()
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <ProtectedSellerRoute>
      <SellerLayout>
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-2">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 animate-pulse h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-indigo-500/10 p-3 rounded-full">
                    <FiPackage className="text-indigo-500 text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-full">
                    <FiShoppingBag className="text-green-500 text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-yellow-500/10 p-3 rounded-full">
                    <FiDollarSign className="text-yellow-500 text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Orders</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.pendingOrders}</p>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-full">
                    <FiTruck className="text-red-500 text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : stats.recentOrders?.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-400">No recent orders</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900/50">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </SellerLayout>
    </ProtectedSellerRoute>
  )
}
