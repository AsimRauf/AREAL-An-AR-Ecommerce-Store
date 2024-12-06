import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../config/db'
import { Product } from '../../../models/Product'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { Seller } from '../../../models/Seller'
const generateSignedUrl = (key: string) => {
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
}

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

    const sellerImageKey = product.seller?.profileImage?.replace('https://tanvircommerce-product-data.s3.ap-south-1.amazonaws.com/', '')

    const [productImages, sellerImage] = await Promise.all([
      Promise.all(product.images.map(key => generateSignedUrl(key))),
      sellerImageKey ? generateSignedUrl(sellerImageKey) : null
    ])

    const productWithUrls = {
      ...product,
      images: productImages,
      glbModel: product.glbModel ? generateSignedUrl(product.glbModel) : null,
      seller: product.seller ? {
        ...product.seller,
        profileImage: sellerImage
      } : null
    }

    res.status(200).json(productWithUrls)
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error processing product',
      error: error.message 
    })
  }
}
