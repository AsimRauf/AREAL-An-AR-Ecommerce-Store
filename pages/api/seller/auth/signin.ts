import { connectDB } from '../../../../config/db'
import { Seller } from '../../../../models/Seller'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { awsConfig } from '../../../../config/aws'
import type { NextApiRequest, NextApiResponse } from 'next'

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    const { email, password } = req.body

    const seller = await Seller.findOne({ email }).select('+password')
    if (!seller) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    let signedImageUrl = null
    if (seller.profileImage) {
      const key = seller.profileImage.split('/').pop()
      const command = new GetObjectCommand({
        Bucket: awsConfig.bucketName,
        Key: `seller-profiles/${key}`
      })
      signedImageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    }

    const token = jwt.sign(
      { sellerId: seller._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        businessName: seller.businessName,
        profileImage: signedImageUrl
      },
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    })

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}
