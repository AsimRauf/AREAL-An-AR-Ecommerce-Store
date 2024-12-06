import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { Product } from '../../../../models/Product'
import { verifySellerToken } from '../../../../utils/sellerAuth'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

const generateSignedUrl = (key: string) => {
  // Set expiration to 7 days for better caching
  const dateLessThan = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const encodedKey = key.split('/').map(part => 
    part.endsWith('.png') ? encodeURIComponent(part) : part
  ).join('/')
  
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${encodedKey}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan
  })
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sellerId = await verifySellerToken(req)
    await connectDB()

    const products = await Product.find({ seller: sellerId }).lean()
    const productsWithUrls = products.map(product => ({
      ...product,
      images: product.images.map(generateSignedUrl)
    }))

    res.status(200).json(productsWithUrls)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Error fetching products' })
  }
}
