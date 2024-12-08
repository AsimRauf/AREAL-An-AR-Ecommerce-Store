import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { Seller } from '../../../../models/Seller'
import bcrypt from 'bcryptjs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { awsConfig } from '../../../../config/aws'

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
})

const generateSafeKey = (email: string) => {
  const timestamp = Date.now()
  const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '-')
  return `seller-profiles/${timestamp}-${safeEmail}.jpg`
}

const uploadSellerProfile = async (imageBuffer: Buffer, email: string) => {
  const key = generateSafeKey(email)
  
  await s3Client.send(new PutObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
    CacheControl: 'max-age=31536000'
  }))
  
  return key
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    const { name, email, password, businessName, businessAddress, image } = req.body

    // Validate required fields
    if (!email || !password || !name || !businessName) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const existingSeller = await Seller.findOne({ email })
    if (existingSeller) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    let profileImageKey = ''
    if (image) {
      try {
        const base64Data = image.split(',')[1]
        const imageBuffer = Buffer.from(base64Data, 'base64')
        profileImageKey = await uploadSellerProfile(imageBuffer, email)
      } catch (error) {
        console.error('Image upload error:', error)
        return res.status(500).json({ message: 'Error uploading profile image' })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newSeller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      businessName,
      businessAddress,
      profileImage: profileImageKey || undefined
    })

    res.status(201).json({
      success: true,
      message: 'Seller account created successfully!',
      sellerId: newSeller._id
    })

  } catch (error) {
    console.error('Seller signup error:', error)
    res.status(500).json({ message: 'Error creating seller account' })
  }
}
