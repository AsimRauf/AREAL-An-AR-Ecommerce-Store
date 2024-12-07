import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../config/db'
import { Product } from '../../models/Product'
import { getEnvironmentSignedUrl } from '../../utils/url-generator'

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

    // Generate signed URLs for images using the new utility
    const productsWithSignedUrls = await Promise.all(products.map(async product => ({
      ...product,
      images: await Promise.all(
        product.images.map(key => getEnvironmentSignedUrl(key))
      )
    })))

    res.status(200).json(productsWithSignedUrls)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: 'Error performing search' })
  }
}
