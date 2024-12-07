import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../config/db'
import { Product } from '../../models/Product'
import { Seller } from '../../models/Seller'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('1. Starting connection...')
    await connectDB()
    console.log('2. DB Connected')

    console.log('3. Attempting product fetch...')
    const products = await Product.find()
      .limit(2)
      .lean()
    
    console.log('4. Products found:', products.length)
    
    return res.status(200).json({
      success: true,
      productCount: products.length,
      products: products
    })

  } catch (error: unknown) {
    console.error('Debug API Error:', error)
    // Send detailed error response
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    } else {
      return res.status(500).json({
        success: false,
        error: 'An unknown error occurred',
        timestamp: new Date().toISOString()
      })
    }
  }
}