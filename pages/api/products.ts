import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../config/db'
import { Product } from '../../models/Product'
import { Seller } from '../../models/Seller'
import { generateSignedUrl } from '../../utils/cloudfront'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    
    // Fetch products with essential fields
    const products = await Product.find()
      .populate({
        path: 'seller',
        model: Seller,
        select: 'businessName profileImage'
      })
      .select('name price badges images seller')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()

    // Generate signed URLs in parallel
    const productsWithSignedUrls = await Promise.all(products.map(async product => {
      // Process product images
      const productImages = await Promise.all(
        product.images.slice(0, 1).map(key => generateSignedUrl(key))
      )

      // Process seller image if exists
      const sellerImage = product.seller?.profileImage ? 
        await generateSignedUrl(product.seller.profileImage) : null

      return {
        ...product,
        images: productImages,
        seller: product.seller ? {
          ...product.seller,
          profileImage: sellerImage
        } : null
      }
    }))

    res.status(200).json(productsWithSignedUrls)

  } catch (error) {
    console.error('Products API Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}