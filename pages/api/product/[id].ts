import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../config/db'
import { Product } from '../../../models/Product'
import { Seller } from '../../../models/Seller'
import { generateSignedUrl } from '../../../utils/cloudfront'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB()
    const { id } = req.query
    
    const product = await Product.findById(id)
      .populate({
        path: 'seller',
        model: Seller,
        select: 'name businessName profileImage'
      })
      .lean()

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Generate all signed URLs in parallel
    const [productImages, sellerImage, glbModelUrl] = await Promise.all([
      // Product images
      Promise.all(
        ((product as any).images || [])
          .filter(Boolean)
          .map((key: string) => generateSignedUrl(key))
      ),
      // Seller image
      (product as any).seller?.profileImage ? 
        generateSignedUrl((product as any).seller.profileImage) : null,
      // GLB model if exists
      (product as any).glbModel ? generateSignedUrl((product as any).glbModel) : null
    ])

    const productWithUrls = {
      ...product,
      images: productImages.filter(Boolean),
      glbModel: glbModelUrl,
      seller: (product as any).seller ? {
        ...(product as any).seller,
        profileImage: sellerImage
      } : null
    }

    res.status(200).json(productWithUrls)

  } catch (error) {
    console.error('Single Product API Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error processing product',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}