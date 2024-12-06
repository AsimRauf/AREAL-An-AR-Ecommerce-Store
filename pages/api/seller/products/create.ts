import { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { Product } from '../../../../models/Product'
import { verifySellerToken } from '../../../../utils/sellerAuth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import { awsConfig } from '../../../../config/aws'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  }
}

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
})

const generateSafeKey = (sellerId: string, originalFilename: string, index?: number) => {
  const timestamp = Date.now()
  const safeFilename = originalFilename
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/\+/g, '-')
  return `products/${sellerId}/${timestamp}-${index ?? ''}-${safeFilename}`
}

const generateSignedUrl = (key: string) => {
  const dateLessThan = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan
  })
}
const uploadToS3 = async (file: formidable.File, sellerId: string, contentType: string, index?: number) => {
  const fileContent = fs.readFileSync(file.filepath)
  const key = generateSafeKey(sellerId, file.originalFilename, index)
  
  await s3Client.send(new PutObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: 'max-age=31536000'
  }))
  
  return key
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sendProgress = (message: string, progress: number) => {
    console.log(`📊 Progress: ${progress}% - ${message}`)
    res.write(`data: ${JSON.stringify({ message, progress })}\n\n`)
  }

  try {
    sendProgress('Starting verification...', 5)
    const sellerId = await verifySellerToken(req)
    
    sendProgress('Connecting to database...', 10)
    await connectDB()
    
    sendProgress('Processing form data...', 15)
    const form = formidable({
      multiples: true,
      maxFileSize: 100 * 1024 * 1024,
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    sendProgress('Form data received', 20)

    // Calculate progress steps for images
    const imageProgressStep = files.images ? 40 / files.images.length : 0
    sendProgress('Starting image uploads...', 25)
    
    const imageKeys = await Promise.all(
      (files.images || []).map(async (file, index) => {
        sendProgress(`Uploading image ${index + 1} of ${files.images.length}`, 25 + (imageProgressStep * index))
        const key = await uploadToS3(file, sellerId, file.mimetype || 'image/jpeg', index)
        sendProgress(`Image ${index + 1} uploaded successfully`, 25 + (imageProgressStep * (index + 1)))
        return key
      })
    )

    let glbModelKey = ''
    if (files.glbModel?.[0]) {
      sendProgress('Starting 3D model upload...', 70)
      const glbFile = files.glbModel[0]
      glbModelKey = await uploadToS3(glbFile, sellerId, 'model/gltf-binary')
      sendProgress('3D model uploaded successfully', 80)
    }

    sendProgress('Creating product in database...', 85)
    const product = await Product.create({
      seller: sellerId,
      name: fields.name[0],
      description: fields.description[0],
      price: parseFloat(fields.price[0]),
      category: fields.category[0],
      images: imageKeys,
      glbModel: glbModelKey,
      specifications: {
        dimensions: fields.dimensions?.[0] || '',
        weight: fields.weight?.[0] || '',
        material: fields.material?.[0] || '',
      }
    })

    sendProgress('Generating signed URLs...', 95)
    const productWithUrls = {
      ...product.toObject(),
      images: imageKeys.map(key => generateSignedUrl(key)),
      glbModel: glbModelKey ? generateSignedUrl(glbModelKey) : ''
    }

    sendProgress('Product creation completed!', 100)
    res.status(201).json(productWithUrls)
  } catch (error: unknown) {
    console.error('Product creation error:', error)
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error creating product', error: error.message })
    } else {
      res.status(500).json({ message: 'Error creating product', error: 'An unknown error occurred' })
    }
  }
}