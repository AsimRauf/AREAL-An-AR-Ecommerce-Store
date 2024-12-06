import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../../config/db'
import { Seller } from '../../../../models/Seller'
import bcrypt from 'bcryptjs'
import { uploadToS3 } from '../../../../utils/s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()
    
    const { name, email, password, businessName, businessAddress, image } = req.body

    const existingSeller = await Seller.findOne({ email })
    if (existingSeller) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    let profileImageUrl = ''
    if (image) {
      const base64Data = image.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      profileImageUrl = await uploadToS3(
        imageBuffer, 
        `seller-profiles/${Date.now()}-${email}.jpg`
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await Seller.create({
      name,
      email,
      password: hashedPassword,
      businessName,
      businessAddress,
      profileImage: profileImageUrl
    })

    res.status(201).json({ 
      success: true,
      message: 'Seller account created successfully!' 
    })
  } catch (error) {
    console.error('Seller signup error:', error)
    res.status(500).json({ message: 'Error creating seller account' })
  }
}
