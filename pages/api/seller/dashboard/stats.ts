import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { verifySellerToken } from '../../../../utils/sellerAuth'
import { Product } from '../../../../models/Product'
import { Order } from '../../../../models/Order'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const sellerId = verifySellerToken(req)
    await connectDB()

    // Get stats in parallel
    const [products, orders] = await Promise.all([
      Product.find({ seller: sellerId }),
      Order.find({ seller: sellerId }).sort({ createdAt: -1 }).limit(10)
    ])

    const stats = {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      recentOrders: orders.map(order => ({
        id: order._id,
        customerName: order.customerName,
        amount: order.amount,
        status: order.status,
        date: order.createdAt
      }))
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Stats API Error:', error)
    res.status(500).json({ message: 'Error fetching stats' })
  }
}
