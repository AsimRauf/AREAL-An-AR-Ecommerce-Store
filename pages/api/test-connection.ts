import { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return res.status(200).json({
        success: true,
        message: 'Already connected',
        state: 'connected'
      })
    }

    const uri = `mongodb+srv://asimraufbuzz:${process.env.MONGODB_PASSWORD}@cluster0.u7sas.mongodb.net/CommerceDB?retryWrites=true&w=majority&connectTimeoutMS=15000`
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000
    })
    
    return res.status(200).json({
      success: true,
      state: mongoose.connection.readyState,
      database: conn.connection.db?.databaseName || 'Unknown'
    })

  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      env: {
        hasPassword: !!process.env.MONGODB_PASSWORD,
        mongoEnvs: Object.keys(process.env).filter(key => key.includes('MONGO'))
      }
    })
  }
}