import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '@/config/db'
import { Product } from '@/models/Product'
import { Seller } from '@/models/Seller'
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
  const { category } = req.query
  const page = parseInt(req.query.page as string) || 1
  const limit = 12
  const skip = (page - 1) * limit
  const sortBy = req.query.sort as string || 'newest'

  let sortQuery = {}
  switch(sortBy) {
    case 'price-low':
      sortQuery = { price: 1 }
      break
    case 'price-high':
      sortQuery = { price: -1 }
      break
    case 'oldest':
      sortQuery = { createdAt: 1 }
      break
    default:
      sortQuery = { createdAt: -1 }
  }

  try {
    await connectDB()
    
    const totalProducts = await Product.countDocuments({ 
      category: { $regex: new RegExp(category as string, 'i') }
    })

    const products = await Product.find({ 
      category: { $regex: new RegExp(category as string, 'i') }
    })
    .populate({
      path: 'seller',
      model: Seller,
      select: 'name businessName profileImage'
    })
    .select('name description price category images seller originalPrice createdAt')
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean()

    const productsWithSignedUrls = products.map(product => {
      const sellerImageUrl = product.seller?.profileImage
      const sellerImageKey = sellerImageUrl?.replace('https://tanvircommerce-product-data.s3.ap-south-1.amazonaws.com/', '')
      
      return {
        ...product,
        images: product.images.map(key => generateSignedUrl(key)),
        seller: product.seller ? {
          ...product.seller,
          profileImage: sellerImageKey ? generateSignedUrl(`${sellerImageKey}`) : null
        } : null
      }
    })

    res.status(200).json({
      products: productsWithSignedUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasMore: page * limit < totalProducts
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category products',
      error: error.message
    })
  }
}
