import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../config/db'
import { User } from '../../models/User'
import bcrypt from 'bcryptjs'
import { uploadToS3 } from '../../utils/s3'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb'
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Route hit:', req.method, req.url)
  console.log('Request headers:', req.headers)

  // Force JSON response type
  res.setHeader('Content-Type', 'application/json')

  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return res.status(200).json({})
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method)
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    console.log('Connecting to database...')
    await connectDB()
    
    const { name, email, password, image } = req.body
    console.log('Received data:', { 
      name, 
      email, 
      hasPassword: !!password, 
      hasImage: !!image 
    })

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields')
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      })
    }

    // Check for existing user
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('User already exists:', email)
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      })
    }

    // Handle image upload
    let profileImageUrl = ''
    if (image) {
      console.log('Processing image upload...')
      const base64Data = image.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      profileImageUrl = await uploadToS3(
        imageBuffer, 
        `profile-images/${Date.now()}-${email}.jpg`
      )
      console.log('Image uploaded successfully:', profileImageUrl)
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('Creating new user...')
    await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage: profileImageUrl,
      role: 'user'
    })

    console.log('User created successfully:', email)
    
    // Return success response
    return res.status(201).json({ 
      success: true,
      message: 'Account created successfully!' 
    })

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Error creating account' 
    })
  }
}
