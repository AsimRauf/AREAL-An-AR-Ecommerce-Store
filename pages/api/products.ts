import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../config/db'
import { Product } from '../../models/Product'
import { Seller } from '../../models/Seller'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { formatPrivateKey } from '../../utils/cloudfront'

const generateSignedUrl = (key: string) => {
  try {
    const formattedKey = formatPrivateKey(process.env.CLOUDFRONT_PRIVATE_KEY!)
    console.log('Formatted key first line:', formattedKey.split('\n')[1]); // Debug log

    return getSignedUrl({
      url: `${process.env.CLOUDFRONT_URL}/${key}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: formattedKey,
      dateLessThan: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error('URL signing error:', error)
    return null
  }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    
    // Limit fields and batch size
    const products = await Product.find()
      .populate({
        path: 'seller',
        model: Seller,
        select: 'businessName profileImage' // Reduced fields
      })
      .select('name price badges images seller') // Only essential fields
      .sort({ createdAt: -1 })
      .limit(12) // Reduced initial load
      .lean()
      .batchSize(5) // Optimize memory usage

    // Pre-generate CloudFront URL base
    const cloudfrontBase = `${process.env.CLOUDFRONT_URL}/`
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    
    // Parallel processing of URLs
    const productsWithSignedUrls = await Promise.all(products.map(async product => {
      const sellerImageKey = product.seller?.profileImage?.replace('https://tanvircommerce-product-data.s3.ap-south-1.amazonaws.com/', '')
      
      // Generate URLs in parallel
      const [productImages, sellerImage] = await Promise.all([
        Promise.all(product.images.slice(0, 1).map(key => generateSignedUrl(key))), // Only first image initially
        sellerImageKey ? generateSignedUrl(sellerImageKey) : null
      ])

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

  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
