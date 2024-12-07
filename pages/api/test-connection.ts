import { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check existing connection
    if (mongoose.connection.readyState === 1) {
      return res.status(200).json({
        success: true,
        message: 'Already connected'
      })
    }

    // Construct connection string
    const password = process.env.MONGODB_PASSWORD
    if (!password) {
      throw new Error('MongoDB password not found in environment')
    }

    const uri = `mongodb+srv://asimraufbuzz:${password}@cluster0.u7sas.mongodb.net/CommerceDB?retryWrites=true&w=majority`

    // Connect with timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    })

    if (!conn.connection.db) {
      throw new Error('Failed to connect to database')
    }

    return res.status(200).json({
      success: true,
      database: conn.connection.db.databaseName
    })

  } catch (error: any) {
    console.error('MongoDB Connection Error:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        hasPassword: !!process.env.MONGODB_PASSWORD,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    })
  }
}