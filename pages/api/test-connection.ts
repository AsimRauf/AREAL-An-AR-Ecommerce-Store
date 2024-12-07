import { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log MongoDB URI (hide password)
    const uri = process.env.MONGODB_URI || ''
    console.log('URI:', uri.replace(/:[^:@]*@/, ':****@'))
    
    // Test connection
    const conn = await mongoose.connect(uri)
    
    res.status(200).json({
      success: true,
      connected: mongoose.connection.readyState === 1,
      dbName: conn.connection.db?.databaseName ?? 'Unknown'
    })
  } catch (error: unknown) {
    console.error('Connection Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    })
  }
}