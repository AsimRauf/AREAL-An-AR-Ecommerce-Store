import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { Product } from '../../../../models/Product'
import { verifySellerToken } from '../../../../utils/sellerAuth'
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { CloudFront } from 'aws-sdk'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const generateSignedUrl = (key: string) => {
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan: new Date(Date.now() + 3600 * 1000)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sellerId = await verifySellerToken(req)
  await connectDB()

  if (req.method === 'DELETE') {
    try {
      const productId = req.query.productid as string
      const product = await Product.findOne({ _id: productId, seller: sellerId })

      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      const deletePromises = product.images.map(imageKey =>
        s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: imageKey
        }))
      )

      if (product.glbModel) {
        deletePromises.push(
          s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: product.glbModel
          }))
        )
      }

      await Promise.all(deletePromises)

      const paths = [...product.images]
      if (product.glbModel) paths.push(product.glbModel)

      if (process.env.CLOUDFRONT_DISTRIBUTION_ID) {
        const cloudFront = new CloudFront({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
          }
        })

        await cloudFront.createInvalidation({
          DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
          InvalidationBatch: {
            CallerReference: `${Date.now()}`,
            Paths: {
              Quantity: paths.length,
              Items: paths.map(path => `/${path}`)
            }
          }
        }).promise()
      }

      await Product.deleteOne({ _id: productId, seller: sellerId })
      res.status(200).json({ message: 'Product and associated files deleted successfully' })
    } catch (error) {
      console.error('Delete error:', error)
      res.status(500).json({ message: 'Failed to delete product' })
    }
  } else if (req.method === 'PUT') {
    try {
      const form = formidable({ multiples: true })
      const [fields, files] = await form.parse(req)

      const productId = req.query.productid as string
      const product = await Product.findOne({ _id: productId, seller: sellerId })

      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      // Clean current image URLs by removing CloudFront domain and query params
      const cleanCurrentImages = (fields.currentImages || []).map((img: string) => {
        const urlPath = img.split('?')[0]
        return urlPath.replace(`${process.env.CLOUDFRONT_URL}/`, '')
      })

      // Find images to delete by comparing clean paths
      const imagesToDelete = product.images.filter(img => !cleanCurrentImages.includes(img))

      // Handle image deletions
      const deletePromises = imagesToDelete.map(imageKey =>
        s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: imageKey
        }))
      )

      // Upload new images
      const newImageKeys = await Promise.all(
        (files.images || []).map(async (file) => {
          const fileContent = fs.readFileSync(file.filepath)
          const timestamp = Date.now()
          const key = `products/${sellerId}/${timestamp}-${file.originalFilename}`

          await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: file.mimetype,
            CacheControl: 'max-age=31536000'
          }))

          return key
        })
      )

      // Handle GLB model
      let newGlbKey = product.glbModel
      if (fields.removeGlbModel?.[0] === 'true') {
        if (product.glbModel) {
          deletePromises.push(
            s3Client.send(new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: product.glbModel
            }))
          )
        }
        newGlbKey = ''
      } else if (files.glbModel?.[0]) {
        if (product.glbModel) {
          deletePromises.push(
            s3Client.send(new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: product.glbModel
            }))
          )
        }

        const glbFile = files.glbModel[0]
        const fileContent = fs.readFileSync(glbFile.filepath)
        const timestamp = Date.now()
        newGlbKey = `models/${sellerId}/${timestamp}-${glbFile.originalFilename}`

        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: newGlbKey,
          Body: fileContent,
          ContentType: 'model/gltf-binary',
          CacheControl: 'max-age=31536000'
        }))
      }

      // Execute all delete operations
      await Promise.all(deletePromises)

      // Update product with clean image keys
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          name: fields.name[0],
          description: fields.description[0],
          price: parseFloat(fields.price[0]),
          category: fields.category[0],
          images: [...cleanCurrentImages, ...newImageKeys],
          glbModel: newGlbKey,
          specifications: {
            dimensions: fields.dimensions?.[0],
            weight: fields.weight?.[0],
            material: fields.material?.[0],
          }
        },
        { new: true }
      )

      // Generate fresh signed URLs for response
      const productWithUrls = {
        ...updatedProduct.toObject(),
        images: updatedProduct.images.map(key => generateSignedUrl(key)),
        glbModel: updatedProduct.glbModel ? generateSignedUrl(updatedProduct.glbModel) : ''
      }

      res.status(200).json(productWithUrls)
    } catch (error) {
      console.error('Update error:', error)
      res.status(500).json({ message: 'Failed to update product' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
