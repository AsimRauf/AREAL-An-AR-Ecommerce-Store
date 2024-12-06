import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../config/db'
import { Product } from '../../models/Product'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

const generateSignedUrl = (key: string) => {
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    const { q } = req.query

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id name images price')
    .limit(5)
    .lean()

    // Generate signed URLs for images
    const productsWithSignedUrls = products.map(product => ({
      ...product,
      images: product.images.map(key => generateSignedUrl(key))
    }))

    res.status(200).json(productsWithSignedUrls)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: 'Error performing search' })
  }
}
