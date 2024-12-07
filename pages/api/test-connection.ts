import { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Construct MongoDB URI properly
    const uri = `mongodb+srv://asimraufbuzz:${process.env.MONGODB_PASSWORD}@cluster0.u7sas.mongodb.net/CommerceDB?retryWrites=true&w=majority`
    
    console.log('Attempting connection...')
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
      error: error instanceof Error ? error.message : String(error),
      envCheck: {
        hasPassword: !!process.env.MONGODB_PASSWORD,
        passwordLength: process.env.MONGODB_PASSWORD?.length || 0
      }
    })
  }
}