import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { Product } from '../../../../models/Product'
import { Seller } from '../../../../models/Seller'
import { getEnvironmentSignedUrl } from '../../../../utils/url-generator'

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

    // Generate signed URLs in parallel
    const productsWithSignedUrls = await Promise.all(products.map(async product => {
      // Process product images in parallel
      const productImages = await Promise.all(
        product.images.filter(Boolean).map(key => getEnvironmentSignedUrl(key))
      )

      // Process seller image if exists
      const sellerImageKey = product.seller?.profileImage?.replace(
        'https://tanvircommerce-product-data.s3.ap-south-1.amazonaws.com/',
        ''
      )
      
      const sellerImage = sellerImageKey ?
        await getEnvironmentSignedUrl(sellerImageKey) : null

      return {
        ...product,
        images: productImages.filter(Boolean),
        seller: product.seller ? {
          ...product.seller,
          profileImage: sellerImage
        } : null
      }
    }))

    res.status(200).json({
      products: productsWithSignedUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasMore: page * limit < totalProducts
      }
    })

  } catch (error: unknown) {
    console.error('Category API Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching category products',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
